use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Arc;
use tokio::sync::Mutex;


// ================= 平台特定导入 =================

#[cfg(target_os = "linux")]
use lwg_core::{
    ConfigManager as LwgConfigManager, 
    controller::WallpaperController, 
    config::AppConfig as LwgAppConfig,
    wallpaper::WallpaperManager,
};

// ================= 数据结构 =================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Wallpaper {
    id: String,
    title: String,
    preview: String,
    wtype: String,
    path: String,
    tags: Vec<String>, 
    size: String,      
}

/// 跨平台配置结构体
/// Linux: 与 lwg_core::AppConfig 完全一致
/// Windows: Mock 版本，用于 UI 开发
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub fps: u32,
    pub volume: u32,
    pub scaling: String,
    #[serde(rename = "muteAudio")]
    pub silence: bool,
    pub no_fullscreen_pause: bool,
    pub disable_mouse: bool,
    #[serde(rename = "noAutomute")]
    pub no_auto_mute: bool,
    pub no_audio_processing: bool,
    pub disable_parallax: bool,
    pub disable_particles: bool,
    pub clamping: String,
    pub last_wallpaper: Option<String>,
    pub last_screen: Option<String>,
    pub wallpaper_properties: std::collections::HashMap<String, serde_json::Value>,
    pub screenshot_delay: u32,
    pub screenshot_res: String,
    pub prefer_xvfb: bool,
    pub active_monitors: std::collections::HashMap<String, String>,
    pub cycle_enabled: bool,
    pub cycle_interval: u32,
    pub cycle_order: String,
    pub assets_path: Option<String>,
    pub workshop_path: Option<String>,
    pub wayland_only_active: bool,
    pub wayland_ignore_appids: String,
    pub compact_mode: bool,
    pub wallpaper_nicknames: std::collections::HashMap<String, String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            fps: 30,
            volume: 0,
            scaling: "default".to_string(),
            silence: true,
            no_fullscreen_pause: false,
            disable_mouse: false,
            no_auto_mute: false,
            no_audio_processing: false,
            disable_parallax: false,
            disable_particles: false,
            clamping: "clamp".to_string(),
            last_wallpaper: None,
            last_screen: None,
            wallpaper_properties: std::collections::HashMap::new(),
            screenshot_delay: 20,
            screenshot_res: "3840x2160".to_string(),
            prefer_xvfb: true,
            active_monitors: std::collections::HashMap::new(),
            cycle_enabled: false,
            cycle_interval: 15,
            cycle_order: "random".to_string(),
            assets_path: None,
            workshop_path: None,
            wayland_only_active: false,
            wayland_ignore_appids: String::new(),
            compact_mode: false,
            wallpaper_nicknames: std::collections::HashMap::new(),
        }
    }
}

#[cfg(target_os = "linux")]
impl From<LwgAppConfig> for AppConfig {
    fn from(config: LwgAppConfig) -> Self {
        Self {
            fps: config.fps,
            volume: config.volume,
            scaling: config.scaling,
            silence: config.silence,
            no_fullscreen_pause: config.no_fullscreen_pause,
            disable_mouse: config.disable_mouse,
            no_auto_mute: config.no_auto_mute,
            no_audio_processing: config.no_audio_processing,
            disable_parallax: config.disable_parallax,
            disable_particles: config.disable_particles,
            clamping: config.clamping,
            last_wallpaper: config.last_wallpaper,
            last_screen: config.last_screen,
            wallpaper_properties: config.wallpaper_properties,
            screenshot_delay: config.screenshot_delay,
            screenshot_res: config.screenshot_res,
            prefer_xvfb: config.prefer_xvfb,
            active_monitors: config.active_monitors,
            cycle_enabled: config.cycle_enabled,
            cycle_interval: config.cycle_interval,
            cycle_order: config.cycle_order,
            assets_path: config.assets_path,
            workshop_path: config.workshop_path,
            wayland_only_active: config.wayland_only_active,
            wayland_ignore_appids: config.wayland_ignore_appids,
            compact_mode: config.compact_mode,
            wallpaper_nicknames: config.wallpaper_nicknames,
        }
    }
}

#[cfg(target_os = "linux")]
impl From<AppConfig> for LwgAppConfig {
    fn from(config: AppConfig) -> Self {
        Self {
            fps: config.fps,
            volume: config.volume,
            scaling: config.scaling,
            silence: config.silence,
            no_fullscreen_pause: config.no_fullscreen_pause,
            disable_mouse: config.disable_mouse,
            no_auto_mute: config.no_auto_mute,
            no_audio_processing: config.no_audio_processing,
            disable_parallax: config.disable_parallax,
            disable_particles: config.disable_particles,
            clamping: config.clamping,
            last_wallpaper: config.last_wallpaper,
            last_screen: config.last_screen,
            wallpaper_properties: config.wallpaper_properties,
            screenshot_delay: config.screenshot_delay,
            screenshot_res: config.screenshot_res,
            prefer_xvfb: config.prefer_xvfb,
            active_monitors: config.active_monitors,
            cycle_enabled: config.cycle_enabled,
            cycle_interval: config.cycle_interval,
            cycle_order: config.cycle_order,
            assets_path: config.assets_path,
            workshop_path: config.workshop_path,
            wayland_only_active: config.wayland_only_active,
            wayland_ignore_appids: config.wayland_ignore_appids,
            compact_mode: config.compact_mode,
            wallpaper_nicknames: config.wallpaper_nicknames,
        }
    }
}

// ================= AppState =================

struct AppState {
    #[cfg(target_os = "linux")]
    controller: Mutex<WallpaperController>,
    
    #[cfg(target_os = "linux")]
    config_manager: Mutex<LwgConfigManager>,
    
    #[cfg(not(target_os = "linux"))]
    _dummy: bool,
}

// ================= 辅助函数 =================

/// 检查配置变更是否需要重启壁纸
/// 只影响壁纸属性的配置项才需要重启
#[cfg(target_os = "linux")]
fn needs_wallpaper_restart(old: &LwgAppConfig, new: &LwgAppConfig) -> bool {
    // 壁纸渲染相关配置
    old.fps != new.fps ||
    old.scaling != new.scaling ||
    old.clamping != new.clamping ||
    old.volume != new.volume ||
    old.silence != new.silence ||
    old.disable_parallax != new.disable_parallax ||
    old.disable_particles != new.disable_particles ||
    old.no_fullscreen_pause != new.no_fullscreen_pause ||
    old.disable_mouse != new.disable_mouse ||
    old.no_auto_mute != new.no_auto_mute ||
    old.no_audio_processing != new.no_audio_processing ||
    old.assets_path != new.assets_path ||
    old.wayland_only_active != new.wayland_only_active ||
    old.wayland_ignore_appids != new.wayland_ignore_appids ||
    old.active_monitors != new.active_monitors
}

/// 格式化文件大小
fn format_size(bytes: u64) -> String {
    if bytes == 0 { return "0 MB".to_string(); }
    format!("{:.1} MB", bytes as f64 / 1024.0 / 1024.0)
}

/// 默认壁纸库路径
fn get_default_workshop_path() -> String {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/home".to_string());
    format!("{}/.local/share/Steam/steamapps/workshop/content/431960", home)
}

// ================= Mock 数据生成 =================

#[cfg(not(target_os = "linux"))]
fn generate_mock_wallpapers() -> Vec<Wallpaper> {
    vec![
        Wallpaper {
            id: "mock_001".to_string(),
            title: "Mock Cyberpunk City".to_string(),
            preview: "https://picsum.photos/seed/cyber/400/225".to_string(),
            wtype: "web".to_string(),
            path: "/mock/path/cyberpunk".to_string(),
            tags: vec!["cyberpunk".to_string(), "city".to_string(), "neon".to_string()],
            size: "45.2 MB".to_string(),
        },
        Wallpaper {
            id: "mock_002".to_string(),
            title: "Mock Mountain Sunset".to_string(),
            preview: "https://picsum.photos/seed/mountain/400/225".to_string(),
            wtype: "video".to_string(),
            path: "/mock/path/mountain".to_string(),
            tags: vec!["nature".to_string(), "sunset".to_string(), "mountain".to_string()],
            size: "128.5 MB".to_string(),
        },
        Wallpaper {
            id: "mock_003".to_string(),
            title: "Mock Space Station".to_string(),
            preview: "https://picsum.photos/seed/space/400/225".to_string(),
            wtype: "scene".to_string(),
            path: "/mock/path/space".to_string(),
            tags: vec!["space".to_string(), "scifi".to_string(), "station".to_string()],
            size: "256.8 MB".to_string(),
        },
        Wallpaper {
            id: "mock_004".to_string(),
            title: "Mock Rainy Tokyo".to_string(),
            preview: "https://picsum.photos/seed/tokyo/400/225".to_string(),
            wtype: "web".to_string(),
            path: "/mock/path/tokyo".to_string(),
            tags: vec!["japan".to_string(), "rain".to_string(), "city".to_string()],
            size: "67.3 MB".to_string(),
        },
        Wallpaper {
            id: "mock_005".to_string(),
            title: "Mock Ocean Waves".to_string(),
            preview: "https://picsum.photos/seed/ocean/400/225".to_string(),
            wtype: "video".to_string(),
            path: "/mock/path/ocean".to_string(),
            tags: vec!["ocean".to_string(), "waves".to_string(), "nature".to_string()],
            size: "189.1 MB".to_string(),
        },
        Wallpaper {
            id: "mock_006".to_string(),
            title: "Mock Fireplace".to_string(),
            preview: "https://picsum.photos/seed/fire/400/225".to_string(),
            wtype: "video".to_string(),
            path: "/mock/path/fireplace".to_string(),
            tags: vec!["cozy".to_string(), "fire".to_string(), "warm".to_string()],
            size: "52.4 MB".to_string(),
        },
    ]
}

// ================= Tauri 命令 =================

#[tauri::command]
async fn get_wallpapers(_state: State<'_, AppState>) -> Result<Vec<Wallpaper>, String> {
    #[cfg(target_os = "linux")]
    {
        println!("🐧 [Linux] 扫描壁纸库...");
        
        // 从配置获取 workshop_path，否则使用默认路径
        let config_manager = _state.config_manager.lock().await;
        let workshop_path = config_manager.config().workshop_path
            .clone()
            .unwrap_or_else(|| get_default_workshop_path());
        drop(config_manager);
        
        println!("📁 [Linux] Workshop 路径: {}", workshop_path);
        
        // 使用 WallpaperManager 扫描
        let mut manager = WallpaperManager::new(&workshop_path);
        let wallpapers = manager.scan()
            .map_err(|e| format!("扫描失败: {:?}", e))?;
        
        // 转换为前端需要的格式
        let result: Vec<Wallpaper> = wallpapers.values().map(|w| {
            Wallpaper {
                id: w.id.clone(),
                title: w.title.clone(),
                preview: w.preview.to_string_lossy().to_string(),
                wtype: w.wp_type.clone(),
                path: workshop_path.clone(),
                tags: w.tags.clone(),
                size: format_size(w.size),
            }
        }).collect();
        
        println!("✅ [Linux] 扫描到 {} 张壁纸", result.len());
        Ok(result)
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 [Windows Mock] 返回模拟壁纸数据");
        Ok(generate_mock_wallpapers())
    }
}

#[tauri::command]
async fn apply_wallpaper(
    id: String, 
    _state: State<'_, AppState> 
) -> Result<(), String> {
    
    #[cfg(target_os = "linux")]
    {
        println!("▶️ [Rust] 正在应用壁纸: {}", id);
        let mut controller = _state.controller.lock().await;
        controller.apply(&id, None).await.map_err(|e| format!("应用失败: {:?}", e))?;
        println!("✅ [Rust] 壁纸应用成功！");
        return Ok(()); // 注意这里要显式返回
    }

    // ✅ 修复方案 2：为非 Linux 平台提供一个显式的默认返回
    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 [Windows] 模拟应用成功: {}", id);
        Ok(()) 
    }
}

#[tauri::command]
async fn stop_wallpaper(_state: State<'_, AppState>) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        let mut controller = _state.controller.lock().await;
        controller.stop().await;
        Ok(())
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 [Windows] 模拟停止");
        Ok(()) // 👈 修复 E0308
    }
}

// ================= Settings Commands =================

#[tauri::command]
async fn get_settings(_state: State<'_, AppState>) -> Result<AppConfig, String> {
    #[cfg(target_os = "linux")]
    {
        let config_manager = _state.config_manager.lock().await;
        Ok(config_manager.config().clone().into()) // 转换为本地 AppConfig
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 [Windows Mock] 返回默认配置");
        Ok(AppConfig::default())
    }
}

#[tauri::command]
async fn save_settings(
    config: AppConfig,
    _state: State<'_, AppState>
) -> Result<bool, String> {
    #[cfg(target_os = "linux")]
    {
        println!("💾 [Linux] 正在保存配置...");
        
        let mut config_manager = _state.config_manager.lock().await;
        let old_config = config_manager.config().clone();
        
        // 转换并更新配置
        let lwg_config: LwgAppConfig = config.into();
        *config_manager.config_mut() = lwg_config.clone();
        
        // 保存到文件
        config_manager.save().map_err(|e| format!("保存失败: {:?}", e))?;
        
        // 检查是否需要重启壁纸
        let needs_restart = needs_wallpaper_restart(&old_config, &lwg_config);
        
        if needs_restart {
            println!("🔄 [Linux] 检测到壁纸相关配置变更，准备重启壁纸...");
            drop(config_manager); // 释放锁
            
            let mut controller = _state.controller.lock().await;
            controller.restart_wallpapers().await.map_err(|e| format!("重启失败: {:?}", e))?;
            println!("✅ [Linux] 壁纸已重启");
        } else {
            println!("ℹ️ [Linux] 配置已保存（无需重启壁纸）");
        }
        
        Ok(needs_restart)
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 [Windows Mock] 模拟保存配置: fps={}, volume={}", config.fps, config.volume);
        Ok(false)
    }
}

#[tauri::command]
async fn restart_wallpapers(_state: State<'_, AppState>) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        println!("🔄 [Rust] 手动重启壁纸...");
        let mut controller = _state.controller.lock().await;
        controller.restart_wallpapers().await.map_err(|e| format!("重启失败: {:?}", e))?;
        println!("✅ [Rust] 壁纸已重启");
        Ok(())
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 [Windows] 模拟重启壁纸");
        Ok(())
    }
}

// ================= System Integration Commands =================

#[tauri::command]
async fn set_autostart(enabled: bool, hidden: bool) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        use std::io::Write;
        
        let autostart_dir = dirs::config_dir()
            .ok_or_else(|| "无法获取配置目录".to_string())?
            .join("autostart");
        
        std::fs::create_dir_all(&autostart_dir)
            .map_err(|e| format!("创建 autostart 目录失败: {}", e))?;
        
        let desktop_path = autostart_dir.join("linux-wallpaperengine-gui.desktop");
        
        if enabled {
            let current_exe = std::env::current_exe()
                .map_err(|e| format!("获取程序路径失败: {}", e))?;
            let exe_path = current_exe.to_string_lossy();
            
            let hidden_arg = if hidden { " --hidden" } else { "" };
            
            let desktop_content = format!(
                r#"[Desktop Entry]
Type=Application
Name=Linux Wallpaper Engine GUI
Comment=Linux Wallpaper Engine GUI
Exec="{}"{}
Icon=linux-wallpaperengine-gui
Terminal=false
Categories=Utility;
"#,
                exe_path, hidden_arg
            );
            
            let mut file = std::fs::File::create(&desktop_path)
                .map_err(|e| format!("创建 desktop 文件失败: {}", e))?;
            file.write_all(desktop_content.as_bytes())
                .map_err(|e| format!("写入 desktop 文件失败: {}", e))?;
            
            println!("✅ [Rust] Autostart 已启用: {:?}", desktop_path);
        } else {
            if desktop_path.exists() {
                std::fs::remove_file(&desktop_path)
                    .map_err(|e| format!("删除 desktop 文件失败: {}", e))?;
            }
            println!("✅ [Rust] Autostart 已禁用");
        }
        
        Ok(())
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 [Windows] Autostart 未实现");
        Ok(())
    }
}

#[tauri::command]
async fn get_autostart_status() -> Result<bool, String> {
    #[cfg(target_os = "linux")]
    {
        let autostart_dir = dirs::config_dir()
            .ok_or_else(|| "无法获取配置目录".to_string())?;
        let desktop_path = autostart_dir.join("autostart/linux-wallpaperengine-gui.desktop");
        Ok(desktop_path.exists())
    }

    #[cfg(not(target_os = "linux"))]
    {
        Ok(false)
    }
}

// ================= 主入口 =================

pub fn run() {
    // 跨平台初始化状态
    #[cfg(target_os = "linux")]
    let app_state = {
        println!("🐧 [Linux] 初始化应用状态...");
        let config_manager = LwgConfigManager::new().expect("Failed to create ConfigManager");
        let shared_config = Arc::new(tokio::sync::Mutex::new(config_manager.config().clone()));
        let controller = WallpaperController::new(shared_config);
        AppState { 
            controller: Mutex::new(controller),
            config_manager: Mutex::new(config_manager),
        }
    };

    #[cfg(not(target_os = "linux"))]
    let app_state = {
        println!("🪟 [Windows Mock] 初始化 Mock 应用状态...");
        AppState { _dummy: true }
    };

    tauri::Builder::default()
        .manage(app_state) 
        .invoke_handler(tauri::generate_handler![
            get_wallpapers, 
            apply_wallpaper,
            stop_wallpaper,
            // Settings commands
            get_settings,
            save_settings,
            restart_wallpapers,
            // System integration commands
            set_autostart,
            get_autostart_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}