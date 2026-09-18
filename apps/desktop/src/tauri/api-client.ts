import { invoke } from "@tauri-apps/api/core";
import { COMMANDS } from "./commands";
import type { AppStatus, BodyProfile, SaveBodyProfileInput } from "./dto";

export function appGetStatus(): Promise<AppStatus> {
  return invoke<AppStatus>(COMMANDS.appGetStatus);
}

export function bodyGetProfile(): Promise<BodyProfile | null> {
  return invoke<BodyProfile | null>(COMMANDS.bodyGetProfile);
}

export function bodySaveProfile(input: SaveBodyProfileInput): Promise<BodyProfile> {
  return invoke<BodyProfile>(COMMANDS.bodySaveProfile, { input });
}
