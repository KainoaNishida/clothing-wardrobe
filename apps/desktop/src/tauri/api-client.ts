import { invoke } from "@tauri-apps/api/core";
import { COMMANDS } from "./commands";
import type { AppStatus } from "./dto";

export function appGetStatus(): Promise<AppStatus> {
  return invoke<AppStatus>(COMMANDS.appGetStatus);
}
