import Cookies from 'js-cookie';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    user: any;
    setUser: React.Dispatch<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const initialUser: any = Cookies.get('user');

    const [user, setUser] = useState(initialUser);

    useEffect(() => {
        if (user) {
            Cookies.set('user', user);
        } else {
            Cookies.remove('user');
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
