import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Folder,
  FileSpreadsheet,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initDriveAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
} from '../services/googleDriveAuth';
import {
  DriveBackupFile,
  uploadBackupToDrive,
  uploadCSVToDrive,
  listDriveBackups,
  fetchBackupContent,
  deleteDriveFile,
} from '../services/googleDriveService';
import { useKhata } from '../context/KhataContext';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ isOpen, onClose }) => {
  const { profile, customers, transactions, restoreBackupJSON } = useKhata();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [files, setFiles] = useState<DriveBackupFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Destructive Action Confirmation States
  const [fileToDelete, setFileToDelete] = useState<DriveBackupFile | null>(null);
  const [fileToRestore, setFileToRestore] = useState<DriveBackupFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Initialize Auth state
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initDriveAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        fetchFiles();
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    // Also check if already cached
    getAccessToken().then((t) => {
      if (t) {
        setToken(t);
        fetchFiles();
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    setAuthError(null);
    try {
      const list = await listDriveBackups();
      setFiles(list);
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
      // If unauthorized, prompt sign in again
      if (err.message && err.message.includes('authenticated')) {
        setToken(null);
      }
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await fetchFiles();
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setAuthError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
    setFiles([]);
  };

  // Upload current khata database as JSON to Google Drive
  const handleUploadCurrentKhata = async () => {
    setIsUploading(true);
    setActionSuccess(null);
    setAuthError(null);
    try {
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        profile,
        customers,
        transactions,
      };

      const createdFile = await uploadBackupToDrive(backupData);
      setActionSuccess(`Backup "${createdFile.name}" successfully saved to Google Drive!`);
      await fetchFiles();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Drive backup failed:', err);
      setAuthError(err.message || 'Failed to upload backup to Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload Excel CSV report to Google Drive
  const handleUploadCSVReport = async () => {
    setIsUploading(true);
    setActionSuccess(null);
    setAuthError(null);
    try {
      const customerMap = new Map(customers.map((c) => [c.id, c]));
      const headers = [
        'Transaction ID',
        'Date & Time',
        'Customer Name',
        'Customer Phone',
        'Type (Udhaar/Jama)',
        'Amount (INR)',
        'Payment Mode',
        'Bill Number',
        'Description',
      ];

      const rows = transactions.map((tx) => {
        const cust = customerMap.get(tx.customerId);
        const formattedDate = new Date(tx.date).toLocaleString('en-IN');
        const typeLabel = tx.type === 'UDHAAR' ? 'Udhaar (Gave)' : 'Jama (Got)';
        return [
          `"${tx.id}"`,
          `"${formattedDate}"`,
          `"${(cust?.name || 'Unknown').replace(/"/g, '""')}"`,
          `"${cust?.phone || ''}"`,
          `"${typeLabel}"`,
          tx.amount,
          `"${tx.paymentMode}"`,
          `"${tx.billNumber || ''}"`,
          `"${(tx.description || '').replace(/"/g, '""')}"`,
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const filename = `MKhata_Report_${new Date().toISOString().split('T')[0]}.csv`;

      const createdFile = await uploadCSVToDrive(csvContent, filename);
      setActionSuccess(`Excel Report "${createdFile.name}" saved to Google Drive!`);
      await fetchFiles();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('CSV upload failed:', err);
      setAuthError(err.message || 'Failed to upload CSV to Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  // Restore with explicit user confirmation
  const handleConfirmRestore = async () => {
    if (!fileToRestore) return;
    setIsRestoring(true);
    try {
      const data = await fetchBackupContent(fileToRestore.id);
      const ok = restoreBackupJSON(JSON.stringify(data));
      if (ok) {
        setActionSuccess(`Data restored successfully from "${fileToRestore.name}"!`);
        setFileToRestore(null);
        setTimeout(() => {
          setActionSuccess(null);
          onClose();
        }, 1500);
      } else {
        setAuthError('Failed to parse backup content from file.');
      }
    } catch (err: any) {
      console.error('Restore failed:', err);
      setAuthError(err.message || 'Failed to restore backup from Google Drive.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Delete from Drive with explicit user confirmation
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setActionSuccess(`File "${fileToDelete.name}" removed from Google Drive.`);
      setFileToDelete(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Delete failed:', err);
      setAuthError(err.message || 'Failed to delete file from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 no-print">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Google Drive Cloud Sync</h2>
              <p className="text-xs text-blue-100">गूगल ड्राइव में सुरक्षित बैकअप रखें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {authError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {!token ? (
            /* Not Signed in View: Official Google Sign-in Button */
            <div className="py-8 px-4 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <HardDrive className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Connect Your Google Drive
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Sign in with your Google account to automatically store your digital khata records, reports, and customer statements safely in a private folder in your Google Drive.
                </p>
              </div>

              {/* Official Google Sign In Button */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isAuthLoading}
                className="mt-2 flex items-center gap-3 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isAuthLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Only accesses the M Khata folder created in your Google Drive.</span>
              </div>
            </div>
          ) : (
            /* Signed in View: Upload & Browse Cloud Backups */
            <>
              {/* Account Header Strip */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google Account'}
                      className="w-9 h-9 rounded-full ring-2 ring-blue-500 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                      {user?.displayName ? user.displayName[0] : 'G'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.displayName || 'Google Drive Connected'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Disconnect Google Drive"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleUploadCurrentKhata}
                  disabled={isUploading}
                  className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex flex-col items-center justify-center gap-1.5 text-center active:scale-95 transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading...' : 'Backup Khata to Drive'}</span>
                  <span className="text-[10px] font-normal opacity-80">Full Database (JSON)</span>
                </button>

                <button
                  onClick={handleUploadCSVReport}
                  disabled={isUploading}
                  className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex flex-col items-center justify-center gap-1.5 text-center active:scale-95 transition-all disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading...' : 'Save Report to Drive'}</span>
                  <span className="text-[10px] font-normal opacity-80">Excel Spreadsheet (CSV)</span>
                </button>
              </div>

              {/* Files in Google Drive Explorer */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <Folder className="w-4 h-4 text-amber-500" />
                    <span>Backups in 'M Khata Backups' Folder</span>
                  </div>

                  <button
                    onClick={fetchFiles}
                    disabled={isLoadingFiles}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Refresh folder"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {isLoadingFiles ? (
                  <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading Google Drive backups...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No backups uploaded to Google Drive yet. Tap "Backup Khata to Drive" above to create your first cloud backup.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto no-scrollbar">
                    {files.map((file) => {
                      const isJson = file.name.endsWith('.json');
                      return (
                        <div
                          key={file.id}
                          className="py-2.5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(file.createdTime).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Restore Button (Only for JSON databases) */}
                            {isJson && (
                              <button
                                onClick={() => setFileToRestore(file)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 transition-colors"
                                title="Restore this backup"
                              >
                                Restore
                              </button>
                            )}

                            {/* View in Drive link */}
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Delete Button (Triggers confirmation dialog) */}
                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Encrypted Cloud Sync via Google</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog: DELETION */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete from Google Drive</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 dark:text-white font-mono">{fileToDelete.name}</strong> from your Google Drive? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog: RESTORE */}
      {fileToRestore && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Restore Backup</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to restore data from{' '}
              <strong className="text-slate-900 dark:text-white font-mono">{fileToRestore.name}</strong>? Your current local khata entries will be replaced with this backup.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToRestore(null)}
                disabled={isRestoring}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isRestoring ? 'Restoring...' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
