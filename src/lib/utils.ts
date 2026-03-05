import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 根据标签内容生成固定的颜色类名
 * 使用简单的哈希算法确保同一标签始终显示相同颜色
 */
export const getColorForTag = (tag: string) => {
  const colors = [
    "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    "bg-purple-100 text-purple-700 hover:bg-purple-100/80 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    "bg-pink-100 text-pink-700 hover:bg-pink-100/80 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
    "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    "bg-indigo-100 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    "bg-orange-100 text-orange-700 hover:bg-orange-100/80 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    "bg-teal-100 text-teal-700 hover:bg-teal-100/80 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  ];

  // 简单的哈希算法：计算字符串 ASCII 码之和
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash += tag.charCodeAt(i);
  }

  return colors[hash % colors.length];
};
