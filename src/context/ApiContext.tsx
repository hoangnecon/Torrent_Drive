"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface ApiContextType {
    apiUrl: string;
    isConnected: boolean;
    setApiUrl: (url: string) => void;
    checkConnection: (url: string) => Promise<boolean>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: React.ReactNode }) {
    const [apiUrl, setApiUrlState] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('colab_api_url');
        if (stored) {
            setApiUrlState(stored);
            checkConnection(stored).then(res => setIsConnected(res));
        }
    }, []);

    const setApiUrl = (url: string) => {
        // Ensure no trailing slash
        const cleanUrl = url.replace(/\/$/, "");
        setApiUrlState(cleanUrl);
        localStorage.setItem('colab_api_url', cleanUrl);
    };

    const checkConnection = async (url: string) => {
        try {
            const cleanUrl = url.replace(/\/$/, "");
            const res = await axios.get(`${cleanUrl}/`, { timeout: 5000 });
            if (res.data.status === 'running') {
                setIsConnected(true);
                return true;
            }
        } catch (e) {
            console.error(e);
            setIsConnected(false);
        }
        return false;
    };

    return (
        <ApiContext.Provider value={{ apiUrl, isConnected, setApiUrl, checkConnection }}>
            {children}
        </ApiContext.Provider>
    );
}

export function useApi() {
    const context = useContext(ApiContext);
    if (context === undefined) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
}
