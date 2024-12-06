export type AnimationType = "fade" | "slide" | "scale" | "bounce";

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay?: number;
  easing?: string;
}

export interface AnimatedOverlay {
  inAnimation: AnimationConfig;
  outAnimation: AnimationConfig;
}

export const ANIMATION_PRESETS: Record<AnimationType, AnimationConfig> = {
  fade: {
    type: "fade",
    duration: 0.5,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  slide: {
    type: "slide",
    duration: 0.5,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  scale: {
    type: "scale",
    duration: 0.5,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  bounce: {
    type: "bounce",
    duration: 0.8,
    easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
};

export type KeyframeProperty =
  | "opacity"
  | "scale"
  | "rotation"
  | "position.x"
  | "position.y"
  | "fontSize"
  | "color";

export interface Keyframe {
  id: string;
  time: number;
  value: number | string;
  property: KeyframeProperty;
  easing: string;
}

export interface AnimationData {
  id: string;
  overlayId: string;
  keyframes: Keyframe[];
}
