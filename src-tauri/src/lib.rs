use serde::{Deserialize, Serialize};
use tauri::State;
use std::path::Path;
use std::fs;
use std::sync::Arc;
use tokio::sync::Mutex;

// 🐧 Linux 平台依赖 - 只有 Linux 下才引入
#[cfg(target_os = "linux")]
use lwg_core::{ConfigManager, WallpaperManager, controller::WallpaperController, config::AppConfig};

// ================= 数据结构 =================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Wallpaper {
    id: String,
    title: String,
    preview: String, // 建议前端改为使用 asset:// 协议，此处保持字段
    wtype: String,
    path: String,
    tags: Vec<String>, 
    size: String,      
}

// 统一 AppState 定义，防止跨平台编译报错
struct AppState {
    #[cfg(target_os = "linux")]
    controller: Mutex<WallpaperController>,
    
    #[cfg(target_os = "linux")]
    config_manager: Mutex<ConfigManager>,
    
    // Windows 下加个哑字段，防止结构体为空
    #[cfg(not(target_os = "linux"))]
    _dummy: bool,
}

// ================= 辅助函数 =================

fn format_size(bytes: u64) -> String {
    if bytes == 0 { return "0 MB".to_string(); }
    format!("{:.1} MB", bytes as f64 / 1024.0 / 1024.0)
}

/// 检查配置变更是否需要重启壁纸
/// 只影响壁纸属性的配置项才需要重启
#[cfg(target_os = "linux")]
fn needs_wallpaper_restart(old: &AppConfig, new: &AppConfig) -> bool {
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

// ================= Tauri 命令 =================

#[tauri::command]
async fn get_wallpapers() -> Result<Vec<Wallpaper>, String> {
    #[cfg(target_os = "linux")]
    {
        // ... (保持你原有的扫描逻辑)
        Ok(vec![]) // 示例占位
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 [Windows] 返回模拟数据");
        Ok(vec![])
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
        Ok(config_manager.config().clone())
    }

    #[cfg(not(target_os = "linux"))]
    {
        // 返回默认配置用于非 Linux 平台
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
        println!("💾 [Rust] 正在保存配置...");
        
        let mut config_manager = _state.config_manager.lock().await;
        let old_config = config_manager.config().clone();
        
        // 更新配置
        *config_manager.config_mut() = config.clone();
        
        // 保存到文件
        config_manager.save().map_err(|e| format!("保存失败: {:?}", e))?;
        
        // 检查是否需要重启壁纸
        let needs_restart = needs_wallpaper_restart(&old_config, &config);
        
        if needs_restart {
            println!("🔄 [Rust] 检测到壁纸相关配置变更，准备重启壁纸...");
            drop(config_manager); // 释放锁
            
            let mut controller = _state.controller.lock().await;
            controller.restart_wallpapers().await.map_err(|e| format!("重启失败: {:?}", e))?;
            println!("✅ [Rust] 壁纸已重启");
        } else {
            println!("ℹ️ [Rust] 配置已保存（无需重启壁纸）");
        }
        
        Ok(needs_restart)
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 [Windows] 模拟保存配置");
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
        let config_manager = ConfigManager::new().expect("Failed to create ConfigManager");
        let shared_config = Arc::new(tokio::sync::Mutex::new(config_manager.config().clone()));
        let controller = WallpaperController::new(shared_config);
        AppState { 
            controller: Mutex::new(controller),
            config_manager: Mutex::new(config_manager),
        }
    };

    #[cfg(not(target_os = "linux"))]
    let app_state = AppState { _dummy: true };

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