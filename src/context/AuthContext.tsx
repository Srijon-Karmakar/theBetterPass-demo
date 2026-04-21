import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { createOrUpdateProfileFromSignup, ensureProviderVerificationRecord, getProfile } from '../lib/destinations';
import type { Profile, SignupInput } from '../lib/destinations';
import { getRoleLabel, getVerificationLabel, isProviderRole, type UserRole } from '../lib/platform';
import { AuthContext } from './auth-context';

const parseAuthRole = (value: unknown): UserRole | null => {
    if (
        value === 'tourist'
        || value === 'tour_company'
        || value === 'tour_instructor'
        || value === 'tour_guide'
        || value === 'admin'
    ) {
        return value;
    }
    return null;
};

const metadataString = (metadata: User['user_metadata'], key: string) => {
    const value = metadata?.[key];
    return typeof value === 'string' && value.trim() ? value : null;
};

const metadataBoolean = (metadata: User['user_metadata'], key: string) => metadata?.[key] === true;

const metadataNumberString = (metadata: User['user_metadata'], key: string) => {
    const value = metadata?.[key];
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return typeof value === 'string' ? value : '';
};

const signupInputFromAuthMetadata = (nextUser: User, role: UserRole, fallbackName?: string | null): SignupInput => {
    const metadata = nextUser.user_metadata;

    return {
        fullName: metadataString(metadata, 'full_name') || fallbackName || nextUser.email?.split('@')[0] || 'Member',
        email: nextUser.email || '',
        password: '',
        role,
        phone: metadataString(metadata, 'phone') || '',
        country: metadataString(metadata, 'country') || '',
        city: metadataString(metadata, 'city') || '',
        bio: metadataString(metadata, 'bio') || '',
        companyName: metadataString(metadata, 'company_name') || '',
        registrationNumber: metadataString(metadata, 'registration_number') || '',
        website: metadataString(metadata, 'website') || '',
        specialties: metadataString(metadata, 'specialties') || '',
        licenseNumber: metadataString(metadata, 'license_number') || '',
        languages: metadataString(metadata, 'languages') || '',
        yearsExperience: metadataNumberString(metadata, 'years_experience'),
        governmentId: metadataString(metadata, 'government_id_ref') || '',
        certificateId: metadataString(metadata, 'certificate_id') || '',
        worksUnderCompany: metadataBoolean(metadata, 'works_under_company'),
    };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);

    const loadProfile = async (nextUser: User | null) => {
        if (!nextUser) {
            setProfile(null);
            setProfileLoading(false);
            return;
        }

        setProfileLoading(true);
        try {
            let profileData = await getProfile(nextUser.id);

            const authRole = parseAuthRole(nextUser.user_metadata?.role);
            const providerRoleFromAuth = isProviderRole(authRole) ? authRole : null;

            if (!profileData && authRole) {
                try {
                    await createOrUpdateProfileFromSignup(nextUser.id, signupInputFromAuthMetadata(nextUser, authRole));
                    profileData = await getProfile(nextUser.id);
                } catch (error) {
                    console.error('Failed bootstrapping profile from auth metadata:', error);
                }
            }

            const effectiveProviderRole = isProviderRole(profileData?.role)
                ? profileData.role
                : providerRoleFromAuth;

            if (effectiveProviderRole) {
                try {
                    if (!isProviderRole(profileData?.role)) {
                        await createOrUpdateProfileFromSignup(
                            nextUser.id,
                            signupInputFromAuthMetadata(nextUser, effectiveProviderRole, profileData?.full_name || 'Provider')
                        );
                        profileData = await getProfile(nextUser.id);
                    }

                    const providerProfile = ({
                        ...(profileData || {}),
                        id: nextUser.id,
                        role: effectiveProviderRole,
                        full_name: profileData?.full_name || nextUser.email?.split('@')[0] || 'Provider',
                    } as Profile);
                    await ensureProviderVerificationRecord(nextUser.id, providerProfile);
                    profileData = await getProfile(nextUser.id);
                } catch (error) {
                    console.error('Failed ensuring provider verification record:', error);
                }
            }
            setProfile(profileData);
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const sessionUser = session?.user ?? null;
            setUser(sessionUser);
            await loadProfile(sessionUser);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const sessionUser = session?.user ?? null;
            setUser(sessionUser);
            void loadProfile(sessionUser);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshProfile = async () => {
        await loadProfile(user);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                profileLoading,
                roleLabel: getRoleLabel(profile?.role),
                verificationLabel: getVerificationLabel(profile?.verification_status),
                isProvider: isProviderRole(profile?.role),
                isAdmin: profile?.role === 'admin',
                refreshProfile,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
