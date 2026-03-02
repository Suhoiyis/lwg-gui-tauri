import { invoke } from "@tauri-apps/api/core";
import { Wallpaper } from "../types";
import { MOCK_WALLPAPERS } from "../mock/wallpapers";

// ================= 🛠️ 调试配置区域 =================

// 🔴 开关 1：是否模拟“空空如也”的状态？
// 设为 true -> 哪怕有数据也返回空数组，用于测试“无壁纸”时的 UI
const FORCE_EMPTY = false; 

// 🔵 开关 2：是否强制使用 Mock 数据？
// 默认为自动检测 (Windows 下自动为 true)，你也可以手动改为 true 强制在 Linux 下调试 UI
const USE_MOCK = navigator.userAgent.includes("Windows") || false;

// ===================================================

export async function scanWallpapers(): Promise<Wallpaper[]> {
  // 1. 优先处理“强制为空”的情况
  if (FORCE_EMPTY) {
    console.log("🈳 [Debug] 模拟空壁纸库...");
    await new Promise((resolve) => setTimeout(resolve, 300)); // 模拟加载延迟
    return [];
  }

  // 2. 处理 Windows 环境或强制 Mock 的情况
  if (USE_MOCK) {
    console.log("🧪 [Debug] 使用 Mock 数据模式");
    await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟网络延迟
    return MOCK_WALLPAPERS;
  }

  // 3. 生产环境：调用真实 Rust 后端
  try {
    console.log("🚀 [Prod] 请求真实壁纸数据...");
    const data = await invoke<any[]>("get_wallpapers");
    
    // 调试：打印第一个壁纸的 preview 路径
    if (data.length > 0) {
      console.log("📷 [Debug] 第一张壁纸 preview 路径:", data[0].preview);
    }
    
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      preview: item.preview,
      path: item.path || "",
      type: (item.wtype || "Scene") as "Video" | "Scene" | "Web",
      tags: item.tags || [],
      size: item.size || "0 MB",
    }));
  } catch (error) {
    console.error("❌ API Error:", error);
    return [];
  }
}

export async function applyWallpaper(id: string): Promise<void> {
  if (USE_MOCK || FORCE_EMPTY) {
    console.log(`🧪 [Debug] 模拟应用壁纸 ID: ${id}`);
    const wp = MOCK_WALLPAPERS.find(w => w.id === id);
    if (wp) console.log(`   选中: ${wp.title}`);
    return;
  }
  await invoke("apply_wallpaper", { id });
}

export async function stopWallpaper(): Promise<void> {
  if (USE_MOCK || FORCE_EMPTY) {
    console.log(`🧪 [Debug] 模拟停止壁纸`);
    return;
  }
  await invoke("stop_wallpaper");
}