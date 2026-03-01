use serde::{Serialize, Deserialize};
// 引入 Tauri 运行时 (如果不引入，下面的 tauri::command 可能报错)
use tauri::Manager; 

// 定义通用的数据结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Wallpaper {
    id: String,
    title: String,
    preview: String,
    wtype: String,
}

#[tauri::command]
fn get_wallpapers() -> Result<Vec<Wallpaper>, String> {
    
    // 🐧 Linux 模式：调用真实后端
    // ---------------------------------------------------------
    // src-tauri/src/lib.rs

    #[cfg(target_os = "linux")]
    {
        println!("🐧 Linux 环境：正在调用 lwg-core..."); 
        
        return Ok(vec![
            Wallpaper {
                id: "RUST-TEST-001".into(),
                title: "🟥 成功了！这是来自 Rust 的红色壁纸".into(), // 名字改得显眼点
                preview: "".into(), // 故意留空，或者放一个本地路径
                wtype: "Scene".into(),
            }
        ]);
    }

    // 🪟 Windows / macOS 模式：Mock 数据
    // ---------------------------------------------------------
    #[cfg(not(target_os = "linux"))]
    {
        println!("🪟 非 Linux 环境：返回 Mock 数据");
        Ok(vec![
            Wallpaper {
                id: "win-mock-1".into(),
                title: "Windows 开发模式 (Video)".into(),
                preview: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e".into(),
                wtype: "Video".into(),
            },
            Wallpaper {
                id: "win-mock-2".into(),
                title: "UI 调试专用 (Scene)".into(),
                preview: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f".into(),
                wtype: "Scene".into(),
            }
        ])
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 👇 这里需要 Cargo.toml 里有 tauri-plugin-shell
        .plugin(tauri_plugin_shell::init()) 
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_wallpapers])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}