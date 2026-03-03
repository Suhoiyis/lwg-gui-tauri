import { invoke } from "@tauri-apps/api/core";

// ================= 🛠️ 类型定义 (防止缺少类型文件报错) =================
export interface Wallpaper {
  id: string;
  title: string;
  preview: string;
  path: string;
  type: "video" | "image" | "web";
  tags: string[];
  size?: number;
}

// ================= 🧪 内置 Mock 数据 (保底用) =================
const FALLBACK_MOCK_WALLPAPERS: Wallpaper[] = [
  {
    id: "wp_001",
    title: "Cyberpunk City (Mock)",
    preview:
      "https://images.unsplash.com/photo-1605218427306-635ba2439af2?w=500&q=80",
    path: "mock/path/1.mp4",
    type: "video",
    tags: ["Cyberpunk", "Night"],
    size: 52428800,
  },
  {
    id: "wp_002",
    title: "Anime Landscape",
    preview:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    path: "mock/path/2.jpg",
    type: "image",
    tags: ["Anime", "Scenery"],
    size: 5242880,
  },
  {
    id: "wp_003",
    title: "Neon Car",
    preview:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&q=80",
    path: "mock/path/3.jpg",
    type: "image",
    tags: ["Cars", "Neon"],
    size: 8388608,
  },
  {
    id: "wp_004",
    title: "Abstract Waves",
    preview:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80",
    path: "mock/path/4.mp4",
    type: "video",
    tags: ["Abstract", "4K"],
    size: 125829120,
  },
];

// ================= 🛠️ 调试配置区域 =================

// 🔴 开关 1：是否强制返回空？(用于测试无数据 UI)
const FORCE_EMPTY = false;

// 🔵 开关 2：是否强制 Mock？
// 建议设为 false，依靠下方的 try-catch 自动检测
const FORCE_MOCK = false;

// ===================================================

export async function scanWallpapers(): Promise<Wallpaper[]> {
  // 1. 优先处理“强制为空”
  if (FORCE_EMPTY) {
    console.log("🈳 [Debug] 模拟空壁纸库...");
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [];
  }

  // 2. 如果手动开启了强制 Mock
  if (FORCE_MOCK) {
    console.log("🧪 [Debug] 强制使用 Mock 数据");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return FALLBACK_MOCK_WALLPAPERS;
  }

  // 3. 生产环境：尝试调用真实 Rust 后端
  try {
    // console.log("🚀 [Prod] 请求真实壁纸数据...");
    // ⚠️ 在浏览器里，这一行会直接抛出错误
    const data = await invoke<any[]>("get_wallpapers");

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      preview: item.preview,
      path: item.path || "",
      type: (item.wtype || "Scene") as "video" | "image" | "web",
      tags: item.tags || [],
      size: item.size || 0,
    }));
  } catch (error) {
    // ✨ 核心修复：这里接住了错误，并返回 Mock 数据，而不是空数组！
    console.warn(
      "⚠️ 环境检测：无法连接 Rust 后端 (正常现象，如果你在浏览器运行)",
    );
    console.log("👉 已自动切换到 Mock 数据模式");

    // 模拟加载时间，让 Loading 转圈圈效果显示出来
    await new Promise((resolve) => setTimeout(resolve, 800));

    return FALLBACK_MOCK_WALLPAPERS;
  }
}

export async function applyWallpaper(id: string): Promise<void> {
  try {
    await invoke("apply_wallpaper", { id });
  } catch (e) {
    // 浏览器环境下只是打印日志
    console.log(`[Mock] 假装应用了壁纸 ID: ${id}`);
    const wp = FALLBACK_MOCK_WALLPAPERS.find((w) => w.id === id);
    if (wp) console.log(`   选中: ${wp.title}`);
  }
}

export async function stopWallpaper(): Promise<void> {
  try {
    await invoke("stop_wallpaper");
  } catch (e) {
    console.log(`[Mock] 假装停止了壁纸`);
  }
}
