use serde::{Deserialize, Serialize};
use tauri::State; // 👈 引入 State
use base64::prelude::*;
use std::path::Path;
use std::fs;
use std::sync::Arc;
use tokio::sync::Mutex; // 👈 使用 tokio 的 Mutex 支持 async

// 🐧 Linux 平台依赖
use lwg_core::{ConfigManager, WallpaperManager, controller::WallpaperController};

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

// 定义一个应用状态结构体，用来存放“长生不老”的对象
struct AppState {
    // Controller 需要被互斥锁保护，因为 Tauri 命令是并发的
    #[cfg(target_os = "linux")]
    controller: Mutex<WallpaperController>,
}

// ================= 辅助函数 =================

fn file_to_base64(path_str: &str) -> String {
    let path = Path::new(path_str);
    if !path.exists() { return "".to_string(); }
    match fs::read(path) {
        Ok(bytes) => {
            let mime = mime_guess::from_path(path).first_or_octet_stream().to_string();
            let b64 = BASE64_STANDARD.encode(bytes);
            format!("data:{};base64,{}", mime, b64)
        },
        Err(_) => "".to_string()
    }
}

fn format_size(bytes: u64) -> String {
    if bytes == 0 { return "0 MB".to_string(); }
    format!("{:.1} MB", bytes as f64 / 1024.0 / 1024.0)
}

// ================= Tauri 命令 =================

#[tauri::command]
async fn get_wallpapers() -> Result<Vec<Wallpaper>, String> {
    #[cfg(target_os = "linux")]
    {
        println!("🐧 [Rust] 正在扫描壁纸...");
        // 临时初始化一个 ConfigManager 只为了读路径
        // (注：更好的做法是把 Config 也放到 State 里，但为了简单先这样)
        let workshop_path = match ConfigManager::new() {
            Ok(cm) => cm.config.assets_path.clone(),
            Err(_) => None,
        };
        
        let target_path = workshop_path.unwrap_or_else(|| {
            let home = std::env::var("HOME").unwrap_or_default();
            format!("{}/.local/share/Steam/steamapps/workshop/content/431960", home)
        });

        if !std::path::Path::new(&target_path).exists() {
            return Err(format!("找不到目录: {}", target_path));
        }

        let mut wm = WallpaperManager::new(target_path);
        wm.scan().map_err(|e| format!("扫描失败: {}", e))?;

        let core_list = wm.list();
        let frontend_wallpapers: Vec<Wallpaper> = core_list
            .into_iter()
            .map(|wp| {
                let preview_path = wp.preview.to_string_lossy().to_string();
                let preview_base64 = file_to_base64(&preview_path);

                Wallpaper {
                    id: wp.id.clone(),
                    title: wp.title.clone(),
                    preview: preview_base64,
                    wtype: wp.wp_type.clone(),
                    path: wp.id.clone(),
                    tags: wp.tags.clone(),
                    size: format_size(wp.size),
                }
            })
            .collect();

        return Ok(frontend_wallpapers);
    }

    #[cfg(not(target_os = "linux"))]
    {
        Ok(vec![])
    }
}

// 🔥 新增：应用壁纸命令
#[tauri::command]
async fn apply_wallpaper(
    id: String, 
    state: State<'_, AppState> // 👈 注入全局状态
) -> Result<(), String> {
    
    #[cfg(target_os = "linux")]
    {
        println!("▶️ [Rust] 正在应用壁纸: {}", id);
        
        // 1. 获取锁 (锁住 Controller 防止并发冲突)
        let mut controller = state.controller.lock().await;
        
        // 2. 调用 lwg-core 的 apply 方法
        // 参数2是 screen，传 None 表示应用到默认/上次的屏幕
        controller.apply(&id, None).await.map_err(|e| format!("应用失败: {:?}", e))?;
        
        println!("✅ [Rust] 壁纸应用成功！");
        Ok(())
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 Windows 模拟应用: {}", id);
        Ok(())
    }
}

// ================= 主入口 =================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // --- 1. 初始化核心状态 ---
    #[cfg(target_os = "linux")]
    let app_state = {
        println!("⚙️ [Init] 初始化核心组件...");
        
        // 初始化配置
        let config_manager = ConfigManager::new().expect("配置加载失败");
        // lwg-core 的 Controller 需要 Arc<Mutex<AppConfig>>
        let shared_config = Arc::new(tokio::sync::Mutex::new(config_manager.config));
        
        // 初始化控制器
        let controller = WallpaperController::new(shared_config);
        
        AppState {
            controller: Mutex::new(controller),
        }
    };

    // Windows 下放个空的 State 占位，防止编译报错
    #[cfg(not(target_os = "linux"))]
    let app_state = AppState {};

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        
        // --- 2. 注册状态 ---
        .manage(app_state) 
        
        // --- 3. 注册命令 ---
        .invoke_handler(tauri::generate_handler![
            get_wallpapers, 
            apply_wallpaper // 👈 别忘了注册这个新命令
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}