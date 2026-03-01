import { invoke } from "@tauri-apps/api/core"; // Tauri v2 使用这个路径
import { Wallpaper } from "../types";

export async function scanWallpapers(): Promise<Wallpaper[]> {
  try {
    console.log("🚀 [API] 准备向 Rust 发送 'get_wallpapers' 指令...");
    
    // 关键：发送指令给 Rust
    // 注意：Rust 返回的数据字段可能叫 wtype，这里需要手动映射一下
    const data = await invoke<any[]>("get_wallpapers");
    
    console.log("✅ [API] Rust 响应成功:", data);

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      preview: item.preview,
      path: item.path || "", // 防止 Rust 没返回 path 导致崩溃
      type: (item.wtype || "Scene") as "Video" | "Scene" | "Web",
    }));
  } catch (error) {
    console.error("❌ [API] 调用 Rust 失败:", error);
    return []; // 如果失败，返回空数组，而不是 Mock 数据
  }
}