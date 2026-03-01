import { invoke } from "@tauri-apps/api/core";
import { Wallpaper } from "../types";

export async function scanWallpapers(): Promise<Wallpaper[]> {
  try {
    console.log("🚀 [API] 请求壁纸数据...");
    
    // 1. 获取后端数据
    const data = await invoke<any[]>("get_wallpapers");
    
    console.log("✅ [API] 收到数据:", data.length, "条");
    // 打印第一条看看字段全不全
    if (data.length > 0) console.log("🔍 首条数据样本:", data[0]);

    // 2. 映射数据
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      preview: item.preview, // 已经是 Base64 了，直接用
      path: item.path || "",
      type: (item.wtype || "Scene") as "Video" | "Scene" | "Web",
      
      // 👇 关键：接收新补全的字段，给个默认值防止报错
      tags: item.tags || [],
      size: item.size || "0 MB",
    }));

  } catch (error) {
    console.error("❌ API Error:", error);
    return [];
  }
}