import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
const AuthContext = createContext({
    session: null,
    signOut: async () => { },
    loading: true,
    signIn: async (email, password) => {
        throw new Error('Function not implemented.');
    }
});
export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, []);
    const signOut = async () => {
        await supabase.auth.signOut();
    };
    const signIn = async (email, password) => {
        await supabase.auth.signInWithPassword({ email, password });
    };
    return (_jsx(AuthContext.Provider, { value: { session, signIn, signOut, loading }, children: !loading && children }));
};
export const useAuth = () => {
    return useContext(AuthContext);
};
