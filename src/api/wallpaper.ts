import { invoke } from "@tauri-apps/api/core";
import { Wallpaper } from "@/types";

// 类型转换函数：后端 wtype -> 前端 type
function normalizeType(wtype: string | undefined): "Video" | "Scene" | "Web" {
  const map: Record<string, "Video" | "Scene" | "Web"> = {
    video: "Video",
    scene: "Scene",
    web: "Web",
  };
  return map[wtype?.toLowerCase() || ""] || "Scene";
}

export interface ScreenshotRecord {
  timestamp: number;
  wpId: string;
  outputPath: string;
  duration: number;
  maxCpu: number;
  maxMem: number;
}

// ================= 🧬 基础 Mock 模板 (5张) =================
const BASE_MOCK_TEMPLATES: Wallpaper[] = [
  // {
  //   id: "base_1",
  //   title: "Cyberpunk City",
  //   preview:
  //     "https://images.unsplash.com/photo-1605218427306-635ba2439af2?w=500&q=80",
  //   path: "mock/path/1.mp4",
  //   type: "Video",
  //   tags: ["Cyberpunk", "Night", "City"],
  //   size: "50 MB",
  // },
  {
    id: "base_2",
    title: "Anime Landscape",
    preview:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    path: "mock/path/2.jpg",
    type: "Scene",
    tags: ["Anime", "Scenery"],
    size: "5 MB",
  },
  {
    id: "base_3",
    title: "Neon Car",
    preview:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&q=80",
    path: "mock/path/3.jpg",
    type: "Scene",
    tags: ["Cars", "Neon"],
    size: "8 MB",
  },
  {
    id: "base_4",
    title: "Abstract Waves",
    preview:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80",
    path: "mock/path/4.mp4",
    type: "Video",
    tags: ["Abstract", "4K"],
    size: "120 MB",
  },
  // {
  //   id: "base_5",
  //   title: "Forest Rain",
  //   preview:
  //     "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?w=500&q=80",
  //   path: "mock/path/5.mp4",
  //   type: "Video",
  //   tags: ["Nature", "Relaxing"],
  //   size: "200 MB",
  // },
  // --- 新增抓取的数据 ---
  {
    id: "base_6",
    title: "Mountain Mist",
    preview:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80",
    path: "mock/path/6.jpg",
    type: "Scene",
    tags: ["Nature", "Mountain", "Mist"],
    size: "6 MB",
  },
  {
    id: "base_7",
    title: "Galaxy Starry",
    preview:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&q=80",
    path: "mock/path/7.jpg",
    type: "Scene",
    tags: ["Space", "Stars", "Dark"],
    size: "7 MB",
  },
  {
    id: "base_8",
    title: "Minimalist Geometry",
    preview:
      "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=500&q=80",
    path: "mock/path/8.mp4",
    type: "Video",
    tags: ["Minimal", "Geometry", "Art"],
    size: "90 MB",
  },
  {
    id: "base_9",
    title: "Ocean Sunset",
    preview:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
    path: "mock/path/9.jpg",
    type: "Scene",
    tags: ["Ocean", "Sunset", "Warm"],
    size: "5.5 MB",
  },
  {
    id: "base_10",
    title: "Tokyo Night Rain",
    preview:
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=500&q=80",
    path: "mock/path/10.mp4",
    type: "Video",
    tags: ["City", "Rain", "Japan"],
    size: "150 MB",
  },
  {
    id: "base_11",
    title: "Desert Dunes",
    preview:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&q=80",
    path: "mock/path/11.jpg",
    type: "Scene",
    tags: ["Desert", "Sand", "Hot"],
    size: "4.5 MB",
  },
  {
    id: "base_12",
    title: "Northern Lights",
    preview:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&q=80",
    path: "mock/path/12.jpg",
    type: "Scene",
    tags: ["Aurora", "Night", "Green"],
    size: "8.5 MB",
  },
];

// ================= 🚀 自动生成扩充版 Mock 数据 (60张) =================
// 这里的逻辑是：把上面5张模板，重复循环12次，生成60张，并修改ID防止重复
const EXPANDED_MOCK_WALLPAPERS = Array.from({ length: 1500 }).map((_, i) => {
  const template = BASE_MOCK_TEMPLATES[i % BASE_MOCK_TEMPLATES.length];
  return {
    ...template,
    id: `mock_wp_${i}`, // 强制生成唯一 ID
    title: `${template.title} #${i + 1}`, // 标题加个序号方便区分
  };
});

// ================= 🛠️ 调试配置 =================
const FORCE_EMPTY = false; // 是否强制返回空列表测试 UI
const FORCE_MOCK = false; // 是否强制在 App 环境也使用 Mock

// ===================================================

export async function scanWallpapers(): Promise<Wallpaper[]> {
  // 1. 测试空状态
  if (FORCE_EMPTY) {
    console.log("🈳 [Debug] 模拟空壁纸库...");
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [];
  }

  // 2. 强制 Mock
  if (FORCE_MOCK) {
    console.log("🧪 [Debug] 强制使用 Mock 数据");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return EXPANDED_MOCK_WALLPAPERS;
  }

  // 3. 真实环境 (带自动降级)
  try {
    // 尝试调用 Rust
    const data = await invoke<any[]>("get_wallpapers");

    // 真实数据转换
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      preview: item.preview,
      path: item.path || "",
      type: normalizeType(item.wtype),
      description: item.description || undefined,
      tags: item.tags || [],
      size: item.size || "0 MB",
    }));
  } catch (error) {
    // ⚠️ 浏览器环境捕获错误 -> 返回扩充后的 Mock 数据
    console.warn(
      "⚠️ 环境检测：无法连接 Rust 后端，已切换至 [扩充版] Mock 数据模式。",
    );
    await new Promise((resolve) => setTimeout(resolve, 600)); // 假装加载一会儿

    return EXPANDED_MOCK_WALLPAPERS;
  }
}

export async function applyWallpaper(
  id: string,
  screen?: string,
): Promise<void> {
  try {
    await invoke("apply_wallpaper", { id, screen });
  } catch (e) {
    console.log(
      `[Mock] 假装应用了壁纸 ID: ${id}${screen ? ` 到屏幕 ${screen}` : ""}`,
    );
    const wp = EXPANDED_MOCK_WALLPAPERS.find((w) => w.id === id);
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

export async function takeScreenshot(
  wallpaperId: string,
  outputPath?: string,
): Promise<ScreenshotRecord> {
  return await invoke("take_screenshot", { wallpaperId, outputPath });
}

export async function getScreenshotHistory(): Promise<ScreenshotRecord[]> {
  return await invoke("get_screenshot_history");
}

export async function openFolder(path: string): Promise<void> {
  await invoke("open_folder", { path });
}

export async function openImage(path: string): Promise<void> {
  await invoke("open_image", { path });
}
