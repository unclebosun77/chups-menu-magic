import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TasteProfile = {
  spiceLevel: "mild" | "medium" | "hot";
  cuisines: string[];
  pricePreference: "budget" | "mid" | "premium";
  proteins: string[];
};

interface TasteProfileContextValue {
  profile: TasteProfile | null;
  setProfile: (profile: TasteProfile) => void;
  resetProfile: () => void;
  isComplete: boolean;
}

const TasteProfileContext = createContext<TasteProfileContextValue | undefined>(undefined);

const STORAGE_KEY = "chups_taste_profile";

export const TasteProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<TasteProfile | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfileState(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load taste profile:", error);
    }
  }, []);

  const setProfile = (newProfile: TasteProfile) => {
    setProfileState(newProfile);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (error) {
      console.error("Failed to save taste profile:", error);
    }
  };

  const resetProfile = () => {
    setProfileState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to reset taste profile:", error);
    }
  };

  const isComplete = profile !== null && 
    profile.cuisines.length > 0 && 
    profile.proteins.length > 0;

  return (
    <TasteProfileContext.Provider value={{ profile, setProfile, resetProfile, isComplete }}>
      {children}
    </TasteProfileContext.Provider>
  );
};

export const useTasteProfile = () => {
  const context = useContext(TasteProfileContext);
  if (context === undefined) {
    throw new Error("useTasteProfile must be used within a TasteProfileProvider");
  }
  return context;
};
