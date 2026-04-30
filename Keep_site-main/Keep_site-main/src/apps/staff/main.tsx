import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../../index.css';
import '../../i18n';
import { StaffApp } from './StaffApp';
import { useFittingStore } from '../../store/useFittingStore';

const Root = () => {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'keep-fitting-storage') {
        useFittingStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return <StaffApp />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
