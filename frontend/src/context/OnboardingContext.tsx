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
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  checklist: ChecklistState;
  completeChecklistTask: (key: keyof ChecklistState) => void;
  checklistDismissed: boolean;
  setChecklistDismissed: (dismissed: boolean) => void;
  resetAllOnboarding: () => void;
}

const STORAGE_KEYS = {
  WELCOME_SEEN: 'runway_onboarding_welcome_seen',
  TOUR_COMPLETED: 'runway_onboarding_tour_completed',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
    } catch {}
  };

  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    return getStorage(STORAGE_KEYS.WELCOME_SEEN, 'false') !== 'true';
  });

  const [tourActive, setTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [checklistDismissed, setChecklistDismissed] = useState<boolean>(true);
  const [checklist, setChecklist] = useState<ChecklistState>({
    connectBank: true,
    addCustomers: true,
    addInvoice: true,
    viewForecast: true,
    checkPurchase: true,
  });

  const completeChecklistTask = (key: keyof ChecklistState) => {
    setChecklist((prev) => ({ ...prev, [key]: true }));
  };

  const resetAllOnboarding = () => {
    setShowWelcomeModal(true);
    setTourStep(0);
    setTourActive(true);
  };

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

  // Exactly 3 Tour Steps: Home -> Forecast -> Check a purchase
  const tourRoutes = [
    '/dashboard',        // Step 0: Home
    '/forecast',         // Step 1: Forecast
    '/pre-transaction',  // Step 2: Check a purchase
  ];

  const nextTourStep = () => {
    if (tourStep < 2) {
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
  };

  const restartTour = () => {
    setTourStep(0);
    setTourActive(true);
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
        isHelpOpen,
        setIsHelpOpen,
        checklist,
        completeChecklistTask,
        checklistDismissed,
        setChecklistDismissed,
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
