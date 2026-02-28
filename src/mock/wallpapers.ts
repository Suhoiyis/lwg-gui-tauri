export interface Wallpaper {
  id: string;
  title: string;
  preview: string;
  description: string;
  type: "Scene" | "Video" | "Web";
}

export const MOCK_WALLPAPERS: Wallpaper[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `wp-${i}`,
  title: `Wallpaper ${i + 1}`,
  preview: `https://placehold.co/400x400/${Math.floor(Math.random()*16777215).toString(16)}/white?text=WP+${i}`,
  description: "Mock Data from Windows",
  type: i % 3 === 0 ? "Video" : (i % 3 === 1 ? "Scene" : "Web"),
}));
