import { useState } from "react";

export function useTrimState(initialDuration: number) {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(initialDuration);
  const [history, setHistory] = useState<Array<{ start: number; end: number }>>(
    [{ start: 0, end: initialDuration }]
  );
  const [historyIndex, setHistoryIndex] = useState(0);

  const setTrimPoints = (start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), { start, end }]);
    setHistoryIndex((prev) => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const { start, end } = history[newIndex];
      setTrimStart(start);
      setTrimEnd(end);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const { start, end } = history[newIndex];
      setTrimStart(start);
      setTrimEnd(end);
      setHistoryIndex(newIndex);
    }
  };

  return {
    trimStart,
    trimEnd,
    setTrimPoints,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
