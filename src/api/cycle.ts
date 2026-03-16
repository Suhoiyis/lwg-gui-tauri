import { invoke } from "@tauri-apps/api/core";

export async function startCycleTimer(): Promise<void> {
  const isTauri = !!(window as any).__TAURI_INTERNALS__;
  if (!isTauri) return;
  await invoke("start_cycle_timer");
}

export async function stopCycleTimer(): Promise<void> {
  const isTauri = !!(window as any).__TAURI_INTERNALS__;
  if (!isTauri) return;
  await invoke("stop_cycle_timer");
}

export async function setCycleScreen(screen: string): Promise<void> {
  const isTauri = !!(window as any).__TAURI_INTERNALS__;
  if (!isTauri) return;
  await invoke("set_cycle_screen", { screen });
}