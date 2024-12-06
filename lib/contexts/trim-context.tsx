import { createContext, useContext } from "react";
import { useTrimState } from "@/hooks/use-trim-state";

interface TrimContextType {
  trimStart: number;
  trimEnd: number;
  setTrimPoints: (start: number, end: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TrimContext = createContext<TrimContextType | null>(null);

export function TrimProvider({
  children,
  duration,
}: {
  children: React.ReactNode;
  duration: number;
}) {
  const trimState = useTrimState(duration);

  return (
    <TrimContext.Provider value={trimState}>{children}</TrimContext.Provider>
  );
}

export const useTrim = () => {
  const context = useContext(TrimContext);
  if (!context) throw new Error("useTrim must be used within TrimProvider");
  return context;
};
