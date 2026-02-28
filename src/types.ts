// src/types.ts
export interface Wallpaper {
  id: string;
  title: string;
  preview: string;
  type: "Video" | "Scene" | "Web";
  path: string;
  tags?: string[];
  size?: string;
}