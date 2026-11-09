import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface ChecklistState {
  connectBank: boolean;
  addCustomers: boolean;
  addInvoice: boolean;
  viewForecast: boolean;
  checkPurchase: boolean;
}

interface OnboardingContextType {
  showWelcomeModal: boolean;
  closeWelcomeModal: () => void;
  tourActive: boolean;
  tourStep: number;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  restartTour: () => void;
  checklist: ChecklistState;
  completeChecklistTask: (key: keyof ChecklistState) => void;
  checklistDismissed: boolean;
  setChecklistDismissed: (dismissed: boolean) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  resetAllOnboarding: () => void;
}

const STORAGE_KEYS = {
  WELCOME_SEEN: 'runway_onboarding_welcome_seen',
  TOUR_COMPLETED: 'runway_onboarding_tour_completed',
  CHECKLIST_DISMISSED: 'runway_onboarding_checklist_dismissed',
  CHECKLIST_STATE: 'runway_onboarding_checklist_state',
};

const initialChecklist: ChecklistState = {
  connectBank: true,     // Done with sample data
  addCustomers: true,    // Done with sample data
  addInvoice: true,      // Done with sample data
  viewForecast: false,   // Guides the user to explore
  checkPurchase: false,  // Guides the user to explore
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Safe localStorage helper
  const getStorage = (key: string, defaultVal: string) => {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const setStorage = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore in private browsing or restricted quota
    }
  };

  // Welcome modal state: shown on very first visit
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    return getStorage(STORAGE_KEYS.WELCOME_SEEN, 'false') !== 'true';
  });

  // Tour state
  const [tourActive, setTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Help drawer state
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Checklist state
  const [checklistDismissed, setChecklistDismissedState] = useState<boolean>(() => {
    return getStorage(STORAGE_KEYS.CHECKLIST_DISMISSED, 'false') === 'true';
  });

  const [checklist, setChecklist] = useState<ChecklistState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHECKLIST_STATE);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return initialChecklist;
  });

  const setChecklistDismissed = (dismissed: boolean) => {
    setChecklistDismissedState(dismissed);
    setStorage(STORAGE_KEYS.CHECKLIST_DISMISSED, String(dismissed));
  };

  const completeChecklistTask = useCallback((key: keyof ChecklistState) => {
    setChecklist((prev) => {
      const updated = { ...prev, [key]: true };
      try {
        localStorage.setItem(STORAGE_KEYS.CHECKLIST_STATE, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Track page visits to auto-complete checklist tasks
  useEffect(() => {
    if (location.pathname === '/forecast') {
      completeChecklistTask('viewForecast');
    } else if (location.pathname === '/pre-transaction') {
      completeChecklistTask('checkPurchase');
    }
  }, [location.pathname, completeChecklistTask]);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
    setStorage(STORAGE_KEYS.WELCOME_SEEN, 'true');
  };

  const startTour = () => {
    closeWelcomeModal();
    setTourStep(0);
    setTourActive(true);
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  const tourRoutes = [
    '/dashboard',       // Step 0: Overview
    '/dashboard',       // Step 1: Needs your attention
    '/forecast',        // Step 2: Cash forecast
    '/pre-transaction', // Step 3: Check a purchase
    '/invoices',        // Step 4: Invoices
    '/dashboard',       // Step 5: Help button
  ];

  const nextTourStep = () => {
    if (tourStep < 5) {
      const next = tourStep + 1;
      setTourStep(next);
      const targetRoute = tourRoutes[next];
      if (targetRoute && location.pathname !== targetRoute) {
        navigate(targetRoute);
      }
    } else {
      skipTour();
    }
  };

  const prevTourStep = () => {
    if (tourStep > 0) {
      const prev = tourStep - 1;
      setTourStep(prev);
      const targetRoute = tourRoutes[prev];
      if (targetRoute && location.pathname !== targetRoute) {
        navigate(targetRoute);
      }
    }
  };

  const skipTour = () => {
    setTourActive(false);
    setStorage(STORAGE_KEYS.TOUR_COMPLETED, 'true');
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  const restartTour = () => {
    setIsHelpOpen(false);
    startTour();
  };

  const resetAllOnboarding = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.WELCOME_SEEN);
      localStorage.removeItem(STORAGE_KEYS.TOUR_COMPLETED);
      localStorage.removeItem(STORAGE_KEYS.CHECKLIST_DISMISSED);
      localStorage.removeItem(STORAGE_KEYS.CHECKLIST_STATE);
    } catch {}
    setShowWelcomeModal(true);
    setTourActive(false);
    setTourStep(0);
    setChecklist(initialChecklist);
    setChecklistDismissedState(false);
    setIsHelpOpen(false);
    navigate('/dashboard');
  };

  return (
    <OnboardingContext.Provider
      value={{
        showWelcomeModal,
        closeWelcomeModal,
        tourActive,
        tourStep,
        startTour,
        nextTourStep,
        prevTourStep,
        skipTour,
        restartTour,
        checklist,
        completeChecklistTask,
        checklistDismissed,
        setChecklistDismissed,
        isHelpOpen,
        setIsHelpOpen,
        resetAllOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

