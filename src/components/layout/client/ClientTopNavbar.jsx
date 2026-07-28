import React from 'react';
import { Sun, Moon, Menu, Rocket } from 'lucide-react';
import NotificationDropdown from '../NotificationDropdown';
import QuickActionsMenu from '../QuickActionsMenu';
import ProfileDropdown from '../../profile/ProfileDropdown';
import { useTheme } from '../../../context/ThemeContext';

const ClientTopNavbar = ({ onOpenMobileDrawer }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 right-0 z-40 w-full md:w-[calc(100%-260px)] flex justify-between items-center h-[72px] md:h-16 px-4 md:px-6 gap-2 md:gap-4 bg-surface/80 dark:bg-surface-dim/70 backdrop-blur-xl md:backdrop-blur-md">
      <div className="flex items-center gap-3 md:gap-4 flex-1">

        {/* Mobile Hamburger Menu & Logo */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onOpenMobileDrawer}
            className="p-2 -ml-2 rounded-xl text-on-surface hover:bg-surface-variant/50 transition-colors focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <Rocket className="text-on-primary w-5 h-5" />
          </div>
        </div>


      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <NotificationDropdown />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <QuickActionsMenu />

        <div className="w-px h-8 bg-outline-variant/20 mx-2 hidden sm:block"></div>

        <ProfileDropdown />
      </div>
    </header>
  );
};

export default ClientTopNavbar;
