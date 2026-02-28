import { invoke } from "@tauri-apps/api/core";
import { MOCK_WALLPAPERS, Wallpaper } from "../mock/wallpapers";

// 强制开启 Mock 模式
const IS_DEV_MOCK = true; 

export async function scanWallpapers(): Promise<Wallpaper[]> {
  if (!IS_DEV_MOCK) {
    return await invoke("scan_wallpapers");
  } else {
    console.log("Using Mock Data for Wallpapers");
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_WALLPAPERS), 500);
    });
  }
}
