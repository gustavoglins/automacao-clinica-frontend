import { createContext, useContext, useEffect, useState } from "react";

interface ClinicContextProps {
  clinicName: string;
  setClinicName: (name: string) => void;
}

const ClinicContext = createContext<ClinicContextProps | undefined>(undefined);

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within ClinicProvider");
  return ctx;
}

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [clinicName, setClinicNameState] = useState<string>(() => {
    return localStorage.getItem("clinicName") || "Alpha Odonto";
  });

  useEffect(() => {
    localStorage.setItem("clinicName", clinicName);
  }, [clinicName]);

  const setClinicName = (name: string) => {
    setClinicNameState(name);
  };

  return (
    <ClinicContext.Provider value={{ clinicName, setClinicName }}>
      {children}
    </ClinicContext.Provider>
  );
}
