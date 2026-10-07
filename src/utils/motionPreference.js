// True if the user has asked their device to reduce motion; we then play simpler animations.
export const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
