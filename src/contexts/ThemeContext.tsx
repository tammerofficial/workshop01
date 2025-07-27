import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export interface AdvancedAppearanceSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
  };
  spacing: {
    padding: number;
    margin: number;
    borderRadius: number;
    gap: number;
  };
  shadows: {
    shadowSize: number;
    shadowBlur: number;
    shadowOpacity: number;
  };
  animations: {
    duration: number;
    easing: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  isDark: boolean;
  advancedSettings: AdvancedAppearanceSettings;
  setAdvancedSettings: (settings: AdvancedAppearanceSettings) => void;
  applyAdvancedSettings: () => void;
}

const defaultAdvancedSettings: AdvancedAppearanceSettings = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#f9fafb',
    border: '#e5e7eb'
  },
  typography: {
    fontFamily: 'SF Pro Display',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5
  },
  spacing: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    gap: 16
  },
  shadows: {
    shadowSize: 4,
    shadowBlur: 6,
    shadowOpacity: 0.1
  },
  animations: {
    duration: 300,
    easing: 'ease-in-out'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [primaryColor, setPrimaryColorState] = useState<string>('#3b82f6');
  const [advancedSettings, setAdvancedSettingsState] = useState<AdvancedAppearanceSettings>(defaultAdvancedSettings);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }

    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      setPrimaryColorState(savedColor);
    }

    const savedAdvancedSettings = localStorage.getItem('advancedSettings');
    if (savedAdvancedSettings) {
      try {
        const parsed = JSON.parse(savedAdvancedSettings);
        setAdvancedSettingsState({ ...defaultAdvancedSettings, ...parsed });
      } catch (error) {
        console.warn('Failed to parse advanced settings from localStorage');
      }
    }
  }, []);

  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Apply all settings to document
  const applyAdvancedSettings = () => {
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--primary-color', advancedSettings.colors.primary);
    root.style.setProperty('--secondary-color', advancedSettings.colors.secondary);
    root.style.setProperty('--accent-color', advancedSettings.colors.accent);
    root.style.setProperty('--background-color', advancedSettings.colors.background);
    root.style.setProperty('--surface-color', advancedSettings.colors.surface);
    root.style.setProperty('--border-color', advancedSettings.colors.border);
    
    // Apply typography
    root.style.setProperty('--font-family', advancedSettings.typography.fontFamily);
    root.style.setProperty('--font-size', `${advancedSettings.typography.fontSize}px`);
    root.style.setProperty('--font-weight', advancedSettings.typography.fontWeight.toString());
    root.style.setProperty('--line-height', advancedSettings.typography.lineHeight.toString());
    
    // Apply spacing
    root.style.setProperty('--padding', `${advancedSettings.spacing.padding}px`);
    root.style.setProperty('--margin', `${advancedSettings.spacing.margin}px`);
    root.style.setProperty('--border-radius', `${advancedSettings.spacing.borderRadius}px`);
    root.style.setProperty('--gap', `${advancedSettings.spacing.gap}px`);
    
    // Apply shadows
    root.style.setProperty('--shadow-size', `${advancedSettings.shadows.shadowSize}px`);
    root.style.setProperty('--shadow-blur', `${advancedSettings.shadows.shadowBlur}px`);
    root.style.setProperty('--shadow-opacity', advancedSettings.shadows.shadowOpacity.toString());
    
    // Apply animations
    root.style.setProperty('--transition-duration', `${advancedSettings.animations.duration}ms`);
    root.style.setProperty('--transition-easing', advancedSettings.animations.easing);
    
    // Generate dynamic shadow
    const shadowColor = isDark ? '0, 0, 0' : '0, 0, 0';
    root.style.setProperty('--shadow', 
      `0 ${advancedSettings.shadows.shadowSize}px ${advancedSettings.shadows.shadowBlur}px rgba(${shadowColor}, ${advancedSettings.shadows.shadowOpacity})`
    );
  };

  // Apply theme and primary color to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    applyAdvancedSettings();
  }, [isDark, advancedSettings]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('selectedTheme', newTheme);
  };

  const setPrimaryColor = (newColor: string) => {
    setPrimaryColorState(newColor);
    localStorage.setItem('primaryColor', newColor);
    // Also update in advanced settings
    setAdvancedSettingsState(prev => ({
      ...prev,
      colors: { ...prev.colors, primary: newColor }
    }));
  };

  const setAdvancedSettings = (newSettings: AdvancedAppearanceSettings) => {
    setAdvancedSettingsState(newSettings);
    localStorage.setItem('advancedSettings', JSON.stringify(newSettings));
    // Update primary color state as well
    setPrimaryColorState(newSettings.colors.primary);
    localStorage.setItem('primaryColor', newSettings.colors.primary);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      primaryColor,
      setPrimaryColor,
      isDark,
      advancedSettings,
      setAdvancedSettings,
      applyAdvancedSettings
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};