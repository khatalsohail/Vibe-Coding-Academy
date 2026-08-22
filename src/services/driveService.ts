import { DriveSyncedFile, TelemetryMetrics } from '../types';

const DRIVE_FOLDER_NAME = 'vibe-coding-site';
const LOCAL_STORAGE_KEY_FILES = 'vibe_coding_drive_files_v1';
const LOCAL_STORAGE_KEY_AUTH = 'vibe_coding_drive_auth_v1';
const LOCAL_STORAGE_KEY_TELEMETRY = 'vibe_coding_telemetry_v1';

export interface DriveAuthStatus {
  isConnected: boolean;
  userEmail: string;
  folderId?: string;
  folderName: string;
  lastSyncedAt?: string;
  syncMode: 'live' | 'cached';
}

const DEFAULT_FILES: DriveSyncedFile[] = [
  {
    id: 'file-1',
    name: 'index.html',
    mimeType: 'text/html',
    size: '3.4 KB',
    updatedAt: new Date().toISOString(),
    contentSnippet: '<!DOCTYPE html>\n<html>\n<head><title>Vibe Site</title></head>\n<body>...</body>\n</html>',
  },
  {
    id: 'file-2',
    name: 'App.tsx',
    mimeType: 'text/typescript',
    size: '4.8 KB',
    updatedAt: new Date().toISOString(),
    contentSnippet: 'import React from "react";\nexport function App() {\n  return <div>Vibe App</div>;\n}',
  },
  {
    id: 'file-3',
    name: 'architecture.json',
    mimeType: 'application/json',
    size: '2.1 KB',
    updatedAt: new Date().toISOString(),
    contentSnippet: '{\n  "topology": "Client-API-PostgreSQL",\n  "auth": "Google OAuth",\n  "securityLevel": "Strict"\n}',
  },
  {
    id: 'file-4',
    name: 'telemetry.json',
    mimeType: 'application/json',
    size: '1.2 KB',
    updatedAt: new Date().toISOString(),
    contentSnippet: '{\n  "promptPrecisionScore": 88,\n  "architecturalClarity": 92,\n  "hallucinationsCaught": 6\n}',
  },
  {
    id: 'file-5',
    name: 'prompt-diffs.json',
    mimeType: 'application/json',
    size: '5.6 KB',
    updatedAt: new Date().toISOString(),
    contentSnippet: '[\n  {\n    "prompt": "Make a secure CRM",\n    "precision": 94,\n    "timestamp": "2026-08-21"\n  }\n]',
  },
];

export class DriveService {
  private static files: DriveSyncedFile[] = [];
  private static authStatus: DriveAuthStatus = {
    isConnected: true,
    userEmail: 'hanuma.chinnu30@gmail.com',
    folderName: DRIVE_FOLDER_NAME,
    folderId: 'gdrive-folder-vibe-coding-site',
    lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    syncMode: 'live',
  };

  static init() {
    try {
      const storedFiles = localStorage.getItem(LOCAL_STORAGE_KEY_FILES);
      if (storedFiles) {
        this.files = JSON.parse(storedFiles);
      } else {
        this.files = [...DEFAULT_FILES];
        this.saveLocal();
      }

      const storedAuth = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
      if (storedAuth) {
        this.authStatus = { ...this.authStatus, ...JSON.parse(storedAuth) };
      }
    } catch (e) {
      console.warn('Drive service local storage error', e);
      this.files = [...DEFAULT_FILES];
    }
  }

  static getAuthStatus(): DriveAuthStatus {
    return { ...this.authStatus };
  }

  static getFiles(): DriveSyncedFile[] {
    return [...this.files];
  }

  static async syncFile(name: string, contentSnippet: string, mimeType: string = 'text/plain'): Promise<DriveSyncedFile> {
    const existingIndex = this.files.findIndex(f => f.name === name);
    const sizeKb = (contentSnippet.length / 1024).toFixed(1) + ' KB';
    const now = new Date().toISOString();

    let syncedFile: DriveSyncedFile;

    if (existingIndex >= 0) {
      syncedFile = {
        ...this.files[existingIndex],
        updatedAt: now,
        size: sizeKb,
        contentSnippet,
      };
      this.files[existingIndex] = syncedFile;
    } else {
      syncedFile = {
        id: 'file-' + Date.now(),
        name,
        mimeType,
        size: sizeKb,
        updatedAt: now,
        contentSnippet,
      };
      this.files.unshift(syncedFile);
    }

    this.authStatus.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.saveLocal();
    return syncedFile;
  }

  static async syncTelemetry(telemetry: TelemetryMetrics): Promise<void> {
    await this.syncFile(
      'telemetry.json',
      JSON.stringify(telemetry, null, 2),
      'application/json'
    );
  }

  static async syncCodeProject(title: string, html: string, code: string, architecture: any): Promise<void> {
    const cleanPrefix = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await Promise.all([
      this.syncFile(`${cleanPrefix}-index.html`, html, 'text/html'),
      this.syncFile(`${cleanPrefix}-App.tsx`, code, 'text/typescript'),
      this.syncFile(`${cleanPrefix}-architecture.json`, JSON.stringify(architecture, null, 2), 'application/json'),
    ]);
  }

  static deleteFile(id: string) {
    this.files = this.files.filter(f => f.id !== id);
    this.saveLocal();
  }

  private static saveLocal() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FILES, JSON.stringify(this.files));
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(this.authStatus));
    } catch (e) {
      console.warn('Failed saving drive files to localStorage', e);
    }
  }
}

// Auto initialize on load
DriveService.init();
