use serde::{Deserialize, Serialize};
use tauri::State;
use std::path::Path;
use std::fs;
use std::sync::Arc;
use tokio::sync::Mutex;

// 🐧 Linux 平台依赖 - 只有 Linux 下才引入
#[cfg(target_os = "linux")]
use lwg_core::{ConfigManager, WallpaperManager, controller::WallpaperController};

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
    
    // Windows 下加个哑字段，防止结构体为空
    #[cfg(not(target_os = "linux"))]
    _dummy: bool,
}

// ================= 辅助函数 =================

fn format_size(bytes: u64) -> String {
    if bytes == 0 { return "0 MB".to_string(); }
    format!("{:.1} MB", bytes as f64 / 1024.0 / 1024.0)
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

// ================= 主入口 =================

pub fn run() {
    // 跨平台初始化状态
    #[cfg(target_os = "linux")]
    let app_state = {
        let config_manager = ConfigManager::new().expect("Fail");
        let shared_config = Arc::new(tokio::sync::Mutex::new(config_manager.config));
        let controller = WallpaperController::new(shared_config);
        AppState { controller: Mutex::new(controller) }
    };

    #[cfg(not(target_os = "linux"))]
    let app_state = AppState { _dummy: true };

    tauri::Builder::default()
        .manage(app_state) 
        .invoke_handler(tauri::generate_handler![
            get_wallpapers, 
            apply_wallpaper,
            stop_wallpaper
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}