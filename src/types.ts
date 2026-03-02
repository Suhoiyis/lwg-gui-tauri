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

export interface AppConfig {
  // --- 1. Playback & Performance (补全版) ---
  fps: number;
  scaling: "default" | "stretch" | "fit" | "fill";
  clamping: "clamp" | "border" | "repeat";       // 新增: 纹理夹持
  
  no_fullscreen_pause: boolean;                  // 新增: 全屏不暂停
  disable_mouse: boolean;
  disable_parallax: boolean;                     // 新增: 禁用视差
  disable_particles: boolean;                    // 新增: 禁用粒子
  
  cycle_enabled: boolean;                        // 新增: 启用循环
  cycle_interval: number;
  cycle_order: "random" | "title" | "size" | "size_desc" | "type" | "id"; // 新增: 循环顺序

  // Wayland Specifics
  wayland_only_active: boolean;                  // 新增
  wayland_ignore_appids: string;                 // 新增 (逗号分隔字符串)

  // --- 2. Audio & Display ---
  volume: number;                // 对应 volume
  mute_audio: boolean;           // 对应 silence (默认 True)
  no_automute: boolean;          // 新增: 禁用自动静音
  no_audio_processing: boolean;  // 新增: 禁用音频处理 (频谱分析)
  monitor: string;               // 对应 monitor
  
  // 新版特性 (保留)
  theme: "light" | "dark" | "system";

  // --- 3. System & Tools ---
  workshop_path: string;
  assets_path: string | null;     // 新增: Assets 目录 (可为空)
  
  autostart: boolean;
  start_hidden: boolean;          // 新增: 启动时最小化 (默认 True)
  
  // 截图工具配置
  screenshot_delay: number;       // 新增: 延迟帧数
  screenshot_res: string;         // 新增: 分辨率 (如 "3840x2160")
  prefer_xvfb: boolean;           // 新增: 优先静默捕获
  
  // 运行时状态 (非配置，但通常由后端返回，这里先定义方便前端用)
  xvfb_installed?: boolean;       // 检测是否安装了 xvfb
}

export interface LogEntry {
  id: number;           // 唯一标识，用于 React key
  timestamp: string;    // "10:00:01"
  level: "info" | "warn" | "error" | "debug";
  source: "GUI" | "Core" | "Engine" | "Controller";
  message: string;
}