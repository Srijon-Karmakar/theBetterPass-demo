import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { ensureProviderVerificationRecord, getProfile } from '../lib/destinations';
import type { Profile } from '../lib/destinations';
import { getRoleLabel, getVerificationLabel, isProviderRole, type UserRole } from '../lib/platform';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    profileLoading: boolean;
    roleLabel: string;
    verificationLabel: string;
    isProvider: boolean;
    isAdmin: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
                const fallbackPayload: Record<string, unknown> = {
                    id: nextUser.id,
                    email: nextUser.email || null,
                    full_name: (typeof nextUser.user_metadata?.full_name === 'string' && nextUser.user_metadata.full_name.trim()) || nextUser.email?.split('@')[0] || 'Member',
                    role: authRole,
                    is_verified: authRole === 'tourist',
                    verification_status: isProviderRole(authRole) ? 'pending' : 'not_required',
                };

                try {
                    await supabase.from('profiles').upsert([fallbackPayload], { onConflict: 'id' });
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
                        await supabase
                            .from('profiles')
                            .upsert([{
                                id: nextUser.id,
                                email: nextUser.email || null,
                                full_name: profileData?.full_name || (typeof nextUser.user_metadata?.full_name === 'string' ? nextUser.user_metadata.full_name : null) || nextUser.email?.split('@')[0] || 'Provider',
                                role: effectiveProviderRole,
                                verification_status: 'pending',
                                is_verified: false,
                            }], { onConflict: 'id' });
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
