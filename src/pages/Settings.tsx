import { useState } from "react";
import { 
  Monitor, Volume2, Cpu, FileText, 
  Layout, MousePointer2, Zap, FolderOpen,
  Terminal, Shield
} from "lucide-react";

type SettingsTab = "general" | "audio" | "advanced" | "logs";

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    // 修复核心: h-full -> min-h-full
    <div className="flex min-h-full w-full bg-background text-white animate-in fade-in duration-300 rounded-xl overflow-hidden border border-white/5">
      
      {/* 左侧设置导航 */}
      <aside className="w-64 border-r border-white/10 p-4 flex flex-col gap-2 bg-surface/50">
        <h2 className="text-2xl font-bold px-4 mb-4 mt-2">Settings</h2>
        
        <NavButton 
          active={activeTab === "general"} 
          onClick={() => setActiveTab("general")}
          icon={<Monitor size={18} />}
          label="General"
        />
        <NavButton 
          active={activeTab === "audio"} 
          onClick={() => setActiveTab("audio")}
          icon={<Volume2 size={18} />}
          label="Audio"
        />
        <NavButton 
          active={activeTab === "advanced"} 
          onClick={() => setActiveTab("advanced")}
          icon={<Cpu size={18} />}
          label="Advanced"
        />
        <NavButton 
          active={activeTab === "logs"} 
          onClick={() => setActiveTab("logs")}
          icon={<FileText size={18} />}
          label="Logs"
        />
      </aside>

      {/* 右侧内容 */}
      <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
        <div className="w-full space-y-8">
          
          {/* 根据 Tab 渲染不同内容 */}
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "audio" && <AudioSettings />}
          {activeTab === "advanced" && <AdvancedSettings />}
          {activeTab === "logs" && <LogViewer />}
          
        </div>
      </main>
    </div>
  );
}

function GeneralSettings() {
  return (
    <>
      <SectionHeader title="General" desc="Configure basic behavior and appearance." />
      <SettingsGroup>
        <SettingRow icon={<Zap className="text-yellow-400" />} label="Start with System" desc="Launch automatically on login" control={<Switch defaultChecked />} />
        <SettingRow icon={<Layout className="text-blue-400" />} label="Scaling Mode" desc="How wallpapers fit your screen" control={<select className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-primary"><option>Cover</option><option>Contain</option><option>Stretch</option></select>} />
      </SettingsGroup>
      <h3 className="text-sm font-bold text-gray-500 uppercase mt-6 mb-2 px-2">Interaction</h3>
      <SettingsGroup>
        <SettingRow icon={<MousePointer2 />} label="Disable Mouse" desc="Ignore mouse interaction on wallpapers" control={<Switch />} />
        <SettingRow label="Pause when Fullscreen" desc="Stop playback when games/videos are active" control={<Switch defaultChecked />} />
      </SettingsGroup>
    </>
  );
}

function AudioSettings() {
  return (
    <>
      <SectionHeader title="Audio" desc="Control wallpaper sound output." />
      <SettingsGroup>
        <SettingRow label="Mute Wallpapers" desc="Globally silence all wallpapers" control={<Switch />} />
        <div className="p-4 border-t border-white/5">
          <div className="flex justify-between mb-2"><span className="text-sm font-medium">Master Volume</span><span className="text-sm text-primary">50%</span></div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-1/2 bg-primary"></div></div>
        </div>
      </SettingsGroup>
    </>
  );
}

function AdvancedSettings() {
  return (
    <>
      <SectionHeader title="Advanced" desc="System paths and developer options." />
      <SettingsGroup>
        <SettingRow icon={<FolderOpen className="text-orange-400" />} label="Workshop Directory" desc="Path to Steam Workshop content (431960)" control={<Button label="Browse..." />} />
        <div className="px-4 pb-4"><code className="block bg-black/30 p-2 rounded text-xs text-gray-400 break-all border border-white/5">/home/user/.local/share/Steam/steamapps/workshop/content/431960</code></div>
      </SettingsGroup>
      <SettingsGroup>
        <SettingRow icon={<Shield className="text-red-400" />} label="Run as Root" desc="Allow running backend with elevated privileges (Unsafe)" control={<Switch />} />
      </SettingsGroup>
    </>
  );
}

function LogViewer() {
  return (
    <>
      <SectionHeader title="System Logs" desc="View backend and UI logs for debugging." />
      <div className="bg-black/40 rounded-xl border border-white/10 p-4 font-mono text-xs h-[500px] overflow-y-auto text-gray-300">
        <p className="text-green-400">[INFO] Application started version 2.0.0</p>
        <p className="text-blue-400">[INFO] Loaded 20 wallpapers from mock data</p>
        <p>[DEBUG] Initializing IPC bridge...</p>
        <p>[DEBUG] Monitor 1 (eDP-1) detected: 1920x1080 @ 60Hz</p>
        <p className="text-yellow-400">[WARN] Tray icon not found, using fallback</p>
      </div>
      <div className="flex gap-2 justify-end"><Button label="Clear Logs" variant="secondary" /><Button label="Copy to Clipboard" /></div>
    </>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? "bg-primary text-background shadow-md shadow-primary/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>{icon}{label}</button>
  );
}

function SectionHeader({ title, desc }: any) {
  return (<div className="mb-6"><h2 className="text-2xl font-bold">{title}</h2><p className="text-gray-400">{desc}</p></div>);
}

function SettingsGroup({ children }: any) {
  return (<div className="bg-surface rounded-xl border border-white/5 overflow-hidden shadow-sm">{children}</div>);
}

function SettingRow({ icon, label, desc, control }: any) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">{icon && <div className="text-gray-400">{icon}</div>}<div><div className="font-medium text-gray-200">{label}</div><div className="text-xs text-gray-500">{desc}</div></div></div>
      <div>{control}</div>
    </div>
  );
}

function Switch({ defaultChecked }: any) {
  return (
    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></label>
  );
}

function Button({ label, variant = "primary" }: any) {
  const base = "px-4 py-2 rounded-lg text-sm font-medium transition-transform active:scale-95";
  const styles = variant === "primary" ? "bg-primary text-background hover:bg-blue-400" : "bg-white/10 text-white hover:bg-white/20";
  return <button className={`${base} ${styles}`}>{label}</button>;
}