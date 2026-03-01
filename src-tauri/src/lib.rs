use serde::{Deserialize, Serialize};
use tauri::Manager;
use base64::prelude::*;
use std::path::Path;
use std::fs;

// 1. 补全字段：与前端接口保持一致
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Wallpaper {
    id: String,
    title: String,
    preview: String,
    wtype: String,
    path: String,
    // 👇 这两个是这次补回来的字段
    tags: Vec<String>, 
    size: String,      
}

// 图片转 Base64 辅助函数
fn file_to_base64(path_str: &str) -> String {
    let path = Path::new(path_str);
    if !path.exists() { return "".to_string(); }
    match fs::read(path) {
        Ok(bytes) => {
            // 简单猜测类型，默认 jpg 也没关系，浏览器容错性很高
            let mime = if path_str.ends_with(".gif") { "image/gif" } else { "image/jpeg" };
            let b64 = BASE64_STANDARD.encode(bytes);
            format!("data:{};base64,{}", mime, b64)
        },
        Err(_) => "".to_string()
    }
}

// 格式化文件大小 (bytes -> MB)
fn format_size(bytes: u64) -> String {
    if bytes == 0 { return "0 MB".to_string(); }
    format!("{:.1} MB", bytes as f64 / 1024.0 / 1024.0)
}

#[cfg(target_os = "linux")]
use lwg_core::{ConfigManager, WallpaperManager};

#[tauri::command]
async fn get_wallpapers() -> Result<Vec<Wallpaper>, String> {
    
    #[cfg(target_os = "linux")]
    {
        println!("🐧 [Rust] 初始化扫描...");
        let workshop_path = match ConfigManager::new() {
            Ok(cm) => cm.config.assets_path.clone(),
            Err(_) => None,
        };
        // 自动探测路径
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
        println!("✅ [Rust] 扫描到 {} 个壁纸", core_list.len());

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
                    // 👇 这里把 core 的数据映射给前端
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![get_wallpapers])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}