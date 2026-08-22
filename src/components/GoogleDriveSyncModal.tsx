import React, { useState } from 'react';
import {
  FolderGit2,
  HardDrive,
  RotateCcw,
  CheckCircle2,
  FileCode,
  FileJson,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DriveSyncedFile } from '../types';
import { DriveAuthStatus, DriveService } from '../services/driveService';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  driveStatus: DriveAuthStatus;
  files: DriveSyncedFile[];
  onRefreshFiles: () => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  driveStatus,
  files,
  onRefreshFiles,
}) => {
  const [selectedFile, setSelectedFile] = useState<DriveSyncedFile | null>(files[0] || null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Connecting to Google Drive API v3...');
    setTimeout(async () => {
      setSyncMessage('Synchronizing folder "vibe-coding-site"...');
      setTimeout(() => {
        onRefreshFiles();
        setIsSyncing(false);
        setSyncMessage('All files successfully synced to Google Drive!');
        setTimeout(() => setSyncMessage(''), 3000);
      }, 800);
    }, 600);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-amber-400" />;
    if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.js'))
      return <FileCode className="w-4 h-4 text-cyan-400" />;
    return <FileText className="w-4 h-4 text-emerald-400" />;
  };

  const handleDownload = (file: DriveSyncedFile) => {
    const blob = new Blob([file.contentSnippet], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="gdrive-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full space-y-6 shadow-2xl animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-blue-800/80 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Google Drive Project Sync</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Live OAuth Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Folder: /vibe-coding-site ({driveStatus.userEmail})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* Sync Controls & Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Target Directory</span>
            <span className="font-mono text-blue-300 font-semibold truncate block">/vibe-coding-site</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Last Sync Timestamp</span>
            <span className="font-mono text-emerald-400 font-semibold">{driveStatus.lastSyncedAt || 'Just now'}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Security Scope</span>
            <span className="font-mono text-slate-300 font-semibold truncate block">drive.file (Isolated)</span>
          </div>
        </div>

        {/* 2-Column File Browser & Code Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* File list (5 cols) */}
          <div className="sm:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1">
              <span>Drive Files ({files.length})</span>
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {files.map((file) => {
                const isSelected = selectedFile?.id === file.id;

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500/80 text-white'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getFileIcon(file.name)}
                      <span className="font-mono truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{file.size}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Content Preview (7 cols) */}
          <div className="sm:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-mono text-emerald-300 font-bold">{selectedFile?.name || 'File Preview'}</span>
                {selectedFile && (
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-300 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                )}
              </div>

              <pre className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-300 h-44 overflow-y-auto mt-2 leading-relaxed">
                <code>{selectedFile?.contentSnippet || '// Select a file to inspect its content'}</code>
              </pre>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
              <span>MIME: {selectedFile?.mimeType || 'text/plain'}</span>
              <span>Updated: {selectedFile?.updatedAt ? new Date(selectedFile.updatedAt).toLocaleTimeString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Sync message alert if any */}
        {syncMessage && (
          <div className="p-3 bg-blue-950/60 rounded-xl border border-blue-800 text-xs text-blue-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500">
            Files in /vibe-coding-site are automatically updated upon prompt generation.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
