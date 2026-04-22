import React, { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './theme-context';
import type { Theme } from './theme-context';

const THEME_STORAGE_KEY = 'tbp-theme';

const getInitialTheme = (): Theme => {
    return 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = 'light';
        window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }, [theme]);

    const value = useMemo(
        () => ({
            theme: 'light' as Theme,
            setTheme: () => setTheme('light'),
            toggleTheme: () => setTheme('light'),
        }),
        [],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
