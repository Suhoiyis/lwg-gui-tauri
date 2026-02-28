// src/lib/utils.ts
// 这是一个简化版的 cn() 函数，用于合并 Tailwind 类名
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}