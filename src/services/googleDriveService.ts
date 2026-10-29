import { getAccessToken } from './googleDriveAuth';

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

const FOLDER_NAME = 'M Khata Backups';

// Helper to get bearer token
async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google. Please sign in to Google Drive.');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Find or create 'M Khata Backups' folder in root
export async function getOrCreateKhataFolder(): Promise<string> {
  const headers = await getAuthHeader();

  // Search for folder
  const query = encodeURIComponent(
    `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    { headers }
  );

  if (!searchRes.ok) {
    const errorBody = await searchRes.text();
    throw new Error(`Drive folder search failed: ${errorBody}`);
  }

  const data = await searchRes.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to create M Khata folder in Google Drive');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

// Upload JSON backup file to Google Drive using multipart upload
export async function uploadBackupToDrive(
  backupData: any,
  customName?: string
): Promise<DriveBackupFile> {
  const headers = await getAuthHeader();
  const folderId = await getOrCreateKhataFolder();

  const businessName = (backupData.profile?.businessName || 'Store').replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = customName || `MKhata_${businessName}_${dateStr}.json`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    description: `M Khata digital hisab kitab automated backup with ${backupData.customers?.length || 0} customers and ${backupData.transactions?.length || 0} transactions.`,
    mimeType: 'application/json',
  };

  const fileContent = JSON.stringify(backupData, null, 2);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,modifiedTime,size,webViewLink',
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${errorText}`);
  }

  return await res.json();
}

// Upload CSV Spreadsheet to Google Drive
export async function uploadCSVToDrive(
  csvContent: string,
  fileName: string
): Promise<DriveBackupFile> {
  const headers = await getAuthHeader();
  const folderId = await getOrCreateKhataFolder();

  const metadata = {
    name: fileName,
    parents: [folderId],
    description: 'M Khata ledger business report in CSV spreadsheet format.',
    mimeType: 'text/csv',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/csv; charset=UTF-8\r\n\r\n' +
    csvContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,modifiedTime,size,webViewLink',
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`CSV Upload failed: ${errorText}`);
  }

  return await res.json();
}

// List all files in the M Khata Backups folder
export async function listDriveBackups(): Promise<DriveBackupFile[]> {
  const headers = await getAuthHeader();
  const folderId = await getOrCreateKhataFolder();

  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,createdTime,modifiedTime,size,webViewLink)`,
    { headers }
  );

  if (!res.ok) {
    throw new Error('Failed to retrieve backup files from Google Drive');
  }

  const data = await res.json();
  return data.files || [];
}

// Download content of a JSON backup file
export async function fetchBackupContent(fileId: string): Promise<any> {
  const headers = await getAuthHeader();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers,
  });

  if (!res.ok) {
    throw new Error('Failed to download backup file content from Google Drive');
  }

  return await res.json();
}

// Delete a file from Google Drive (Requires user confirmation in caller UI)
export async function deleteDriveFile(fileId: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete file from Google Drive');
  }
}
