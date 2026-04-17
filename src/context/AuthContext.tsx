import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { getProfile } from '../lib/destinations';
import type { Profile } from '../lib/destinations';
import { getRoleLabel, getVerificationLabel, isProviderRole } from '../lib/platform';

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
            const profileData = await getProfile(nextUser.id);
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
                isAdmin: profile?.role === 'admin' || (!!user?.email && adminEmails.includes(user.email.toLowerCase())),
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
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
        .split(',')
        .map((item: string) => item.trim().toLowerCase())
        .filter(Boolean);
