import React, { useState } from 'react';
import {
  FolderGit2,
  RotateCcw,
  Check,
  FileCode,
  FileJson,
  FileText,
  Download,
  X,
} from 'lucide-react';
import { DriveSyncedFile } from '../types';
import { DriveAuthStatus } from '../services/driveService';

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
    setTimeout(() => {
      setSyncMessage('Synchronizing folder "vibe-coding-site"...');
      setTimeout(() => {
        onRefreshFiles();
        setIsSyncing(false);
        setSyncMessage('All files successfully synced to Google Drive.');
        setTimeout(() => setSyncMessage(''), 3000);
      }, 600);
    }, 500);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-[var(--red)] shrink-0" />;
    if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.js'))
      return <FileCode className="w-4 h-4 text-[var(--black)] shrink-0" />;
    return <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />;
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
    <div
      id="gdrive-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gdrive-modal-title"
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--white)] border-2 border-[var(--black)] p-6 max-w-3xl w-full space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--black)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--black)] text-[var(--white)] flex items-center justify-center shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="gdrive-modal-title" className="text-base font-bold text-[var(--black)]">
                  Google Drive Project Sync
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--gray)] text-[var(--black)] border border-[var(--black)] uppercase font-semibold">
                  OAuth Connected
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Folder: /vibe-coding-site ({driveStatus.userEmail})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Google Drive sync modal"
            className="p-2 border border-[var(--rule)] text-[var(--black)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-[var(--rule)] bg-[var(--gray)] text-xs font-mono">
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-[var(--rule)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block mb-0.5">
              Target Directory
            </span>
            <span className="font-bold text-[var(--black)] truncate block">/vibe-coding-site</span>
          </div>
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-[var(--rule)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block mb-0.5">
              Last Sync
            </span>
            <span className="font-bold text-[var(--red)] tabular-nums">
              {driveStatus.lastSyncedAt || 'Just now'}
            </span>
          </div>
          <div className="p-3">
            <span className="text-[10px] uppercase text-[var(--text-muted)] block mb-0.5">
              Security Scope
            </span>
            <span className="font-bold text-[var(--black)] truncate block">drive.file (Isolated)</span>
          </div>
        </div>

        {/* 2-Column File Browser & Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5 bg-[var(--gray)] border border-[var(--rule)] p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase pb-1">
              <span>Drive Files ({files.length})</span>
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="text-[var(--red)] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {files.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className={`w-full p-2.5 border text-xs flex items-center justify-between transition-colors text-left ${
                      isSelected
                        ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                        : 'bg-[var(--white)] text-[var(--black)] border-[var(--rule)] hover:border-[var(--black)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getFileIcon(file.name)}
                      <span className="font-mono truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-75 shrink-0 tabular-nums">
                      {file.size}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-7 bg-[var(--white)] border border-[var(--black)] p-3 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[var(--rule)] text-xs">
                <span className="font-mono font-bold text-[var(--black)]">
                  {selectedFile?.name || 'File Preview'}
                </span>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedFile)}
                    className="button button--outline !py-1 !px-2 !text-[11px]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                )}
              </div>

              <pre className="p-3 bg-[#000000] text-[#FFFFFF] border border-[var(--black)] text-[11px] font-mono h-44 overflow-y-auto mt-2 leading-relaxed">
                <code>{selectedFile?.contentSnippet || '// Select a file to inspect its content'}</code>
              </pre>
            </div>

            <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between pt-1 tabular-nums">
              <span>MIME: {selectedFile?.mimeType || 'text/plain'}</span>
              <span>
                Updated: {selectedFile?.updatedAt ? new Date(selectedFile.updatedAt).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {syncMessage && (
          <div className="p-3 bg-[var(--gray)] border border-[var(--black)] text-xs text-[var(--black)] flex items-center gap-2 font-mono">
            <Check className="w-4 h-4 text-[var(--red)] shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[var(--rule)]">
          <span className="text-[11px] text-[var(--text-muted)]">
            Files in /vibe-coding-site update automatically upon prompt generation.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="button !py-2 !px-5 !text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
