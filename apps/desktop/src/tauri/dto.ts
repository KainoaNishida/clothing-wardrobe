export interface AppStatus {
  appName: string;
  architecture: string;
  persistence: string;
  appDataDir: string;
  appLocalDataDir: string;
  databasePath: string;
  databaseReady: boolean;
}
