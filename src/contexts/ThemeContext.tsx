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
    primary: '#000000',
    secondary: '#8a8a8a',
    accent: '#858585',
    background: '#ffffff',
    surface: '#f9fafb',
    border: '#e5e7eb'
  },
  typography: {
    fontFamily: 'Tajawal',
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
  const [primaryColor, setPrimaryColorState] = useState<string>('#000000');
  const [advancedSettings, setAdvancedSettingsState] = useState<AdvancedAppearanceSettings>(defaultAdvancedSettings);

  // Load saved settings from server and localStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load global theme settings from server first
        const { systemSettingsApi } = await import('../api/laravel');
        const response = await systemSettingsApi.getThemeSettings();
        const globalSettings = response.data.data;
        
        // Apply global settings
        if (globalSettings.primaryColor) {
          setPrimaryColorState(globalSettings.primaryColor);
        }
        if (globalSettings.theme) {
          setThemeState(globalSettings.theme);
        }
        
        // Update advanced settings with global values
        const newAdvancedSettings = {
          ...defaultAdvancedSettings,
          colors: {
            ...defaultAdvancedSettings.colors,
            primary: globalSettings.primaryColor || defaultAdvancedSettings.colors.primary,
            secondary: globalSettings.secondaryColor || defaultAdvancedSettings.colors.secondary,
            background: globalSettings.backgroundColor || defaultAdvancedSettings.colors.background,
          },
          typography: {
            ...defaultAdvancedSettings.typography,
            fontFamily: globalSettings.fontFamily || defaultAdvancedSettings.typography.fontFamily,
            fontSize: globalSettings.fontSize || defaultAdvancedSettings.typography.fontSize,
          },
          spacing: {
            ...defaultAdvancedSettings.spacing,
            borderRadius: globalSettings.borderRadius || defaultAdvancedSettings.spacing.borderRadius,
          }
        };
        setAdvancedSettingsState(newAdvancedSettings);
        
      } catch (error) {
        console.warn('Failed to load global theme settings, using local/defaults');
        
        // Fallback to localStorage
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
      }
    };
    
    loadSettings();
  }, []);

  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Apply all settings to document
  const applyAdvancedSettings = () => {
    const root = document.documentElement;
    
    // Apply colors with theme-aware adjustments
    if (isDark) {
      // Dark mode colors - use user settings where applicable
      root.style.setProperty('--primary-color', advancedSettings.colors.primary || '#60a5fa');
      root.style.setProperty('--secondary-color', advancedSettings.colors.secondary || '#94a3b8');
      root.style.setProperty('--bg-primary', '#0f172a'); // Very dark blue
      root.style.setProperty('--bg-secondary', '#1e293b'); // Dark blue
      root.style.setProperty('--bg-tertiary', '#334155'); // Medium gray
      root.style.setProperty('--text-primary', '#f8fafc'); // Almost white
      root.style.setProperty('--text-secondary', '#cbd5e1'); // Light gray
      root.style.setProperty('--border-color', '#334155'); // Medium gray
      root.style.setProperty('--sidebar-bg', advancedSettings.colors.background || '#1e293b');
      root.style.setProperty('--card-bg', '#1e293b');
      root.style.setProperty('--hover-bg', '#334155');
      root.style.setProperty('--background-color', advancedSettings.colors.background || '#1e293b');
    } else {
      // Light mode colors - matching dark mode structure
      root.style.setProperty('--primary-color', advancedSettings.colors.primary || '#3b82f6');
      root.style.setProperty('--secondary-color', advancedSettings.colors.secondary || '#6b7280');
      root.style.setProperty('--bg-primary', '#f8fafc'); // Light gray - main background
      root.style.setProperty('--bg-secondary', '#ffffff'); // White - cards/panels
      root.style.setProperty('--bg-tertiary', '#f1f5f9'); // Lighter gray - input fields
      root.style.setProperty('--text-primary', '#1e293b'); // Dark text
      root.style.setProperty('--text-secondary', '#64748b'); // Medium gray text
      root.style.setProperty('--border-color', '#e2e8f0'); // Light gray borders
      root.style.setProperty('--sidebar-bg', advancedSettings.colors.background || '#ffffff');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--hover-bg', '#f1f5f9');
      root.style.setProperty('--background-color', advancedSettings.colors.background || '#f8fafc');
    }
    
    root.style.setProperty('--accent-color', advancedSettings.colors.accent);
    root.style.setProperty('--surface-color', advancedSettings.colors.surface);
    
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
    
    // Apply settings immediately after theme change
    setTimeout(() => {
      applyAdvancedSettings();
    }, 0);
  };

  const setPrimaryColor = async (newColor: string) => {
    setPrimaryColorState(newColor);
    localStorage.setItem('primaryColor', newColor);
    
    // Try to save to server for global use
    try {
      const { systemSettingsApi } = await import('../api/laravel');
      await systemSettingsApi.updateThemeSettings({
        primaryColor: newColor
      });
      console.log('Global theme updated successfully');
    } catch (error) {
      console.warn('Failed to update global theme, saved locally only');
    }
    
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
    
    // Apply settings immediately
    setTimeout(() => {
      applyAdvancedSettings();
    }, 0);
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