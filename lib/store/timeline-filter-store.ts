import { create } from "zustand";

type FilterType = "all" | "text" | "image";

interface TimelineFilterState {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
}

export const useTimelineFilter = create<TimelineFilterState>((set) => ({
  activeFilter: "all",
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
