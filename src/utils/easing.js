export const smoothstep = (x) => x * x * (3 - 2 * x)

export const easeOutCubic = (u) => 1 - (1 - u) ** 3

// Starts fast, overshoots the target a little, then settles back: a springy "pop".
export function easeOutBack(u, overshoot) {
  const c3 = overshoot + 1
  return 1 + c3 * (u - 1) ** 3 + overshoot * (u - 1) ** 2
}

export const clamp01 = (x) => Math.min(Math.max(x, 0), 1)
