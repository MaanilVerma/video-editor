import { useEffect, useCallback } from "react";

type HotkeyCallback = () => void;
type Hotkey = [string, HotkeyCallback];

export function useHotkeys(hotkeys: Hotkey[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const hotkey = hotkeys.find(([k]) => k === key);

      if (hotkey) {
        event.preventDefault();
        hotkey[1]();
      }
    },
    [hotkeys]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
