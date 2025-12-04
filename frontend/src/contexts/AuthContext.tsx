import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  user_type: 'farmer' | 'agro_startup';
  full_name: string;
  phone: string | null;
  state: string;
  district: string;
  crops: string[];
  farm_size: string;
  annual_income: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  isProfileComplete: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Track if we've already fetched the profile to prevent duplicate calls
  const hasFetchedProfileRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Check if profile is complete
  const isProfileComplete = profile !== null;

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string, forceRefresh = false) => {
    // Skip if we've already fetched for this user (unless forced)
    if (!forceRefresh && hasFetchedProfileRef.current && lastUserIdRef.current === userId) {
      return;
    }

    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Profile doesn't exist yet
        if (error.code === 'PGRST116') {
          setProfile(null);
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfile(data);
      }

      // Mark as fetched
      hasFetchedProfileRef.current = true;
      lastUserIdRef.current = userId;
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Refresh profile (call this after updating profile)
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, true); // Force refresh
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      }

      setLoading(false);
    });

    // Listen for auth changes - but only act on real auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only process actual sign-in/sign-out events, not token refreshes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_OUT') {
          // Clear profile on sign out
          setProfile(null);
          hasFetchedProfileRef.current = false;
          lastUserIdRef.current = null;
        } else if (session?.user && event === 'SIGNED_IN') {
          // Only fetch on explicit sign in (not token refresh)
          fetchProfile(session.user.id);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Just update session, don't refetch profile
        setSession(session);
        setUser(session?.user ?? null);
        // DON'T call fetchProfile here - this prevents refetch on tab switch!
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Fetch profile after login (force refresh)
      if (data.user) {
        await fetchProfile(data.user.id, true);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    hasFetchedProfileRef.current = false;
    lastUserIdRef.current = null;
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    isProfileComplete,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};