import { Moon, Sun } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

export const ThemeToggle = () => {
  const { theme, setTheme } = useUserStore();

  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button className="btn-icon" onClick={handleToggle} aria-label="Toggle Theme">
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};
