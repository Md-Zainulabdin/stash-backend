import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Initialize OAuth2 client
export const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes needed for Google Drive
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Create and manage files
  'https://www.googleapis.com/auth/drive.readonly', // Read files
];

// Generate Google OAuth URL
export const getGoogleAuthUrl = (): string => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force consent screen to get refresh token
  });
};

// Exchange auth code for tokens
export const getTokensFromCode = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Create Google Drive API instance with user tokens
export const getDriveService = (accessToken: string, refreshToken?: string) => {
  const auth = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  return google.drive({ version: 'v3', auth });
};

// File category mapping based on MIME types
export const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'Images';
  if (mimeType === 'application/pdf') return 'PDFs';
  if (mimeType.includes('sheet') || mimeType.includes('csv') || mimeType.includes('excel')) return 'Sheets';
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType === 'text/plain') return 'Docs';
  return 'Others';
};

// Create folder structure in Google Drive
export const createDriveFolderStructure = async (
  driveService: any, 
  subjectName: string, 
  parentFolderId?: string
) => {
  try {
    // Create main subject folder
    const subjectFolder = await driveService.files.create({
      requestBody: {
        name: subjectName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      }
    });

    const subjectFolderId = subjectFolder.data.id;

    // Create category subfolders
    const categories = ['Images', 'PDFs', 'Sheets', 'Docs'];
    const folderIds: { [key: string]: string } = {};

    for (const category of categories) {
      const categoryFolder = await driveService.files.create({
        requestBody: {
          name: category,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [subjectFolderId]
        }
      });
      folderIds[category] = categoryFolder.data.id;
    }

    return {
      subjectFolderId,
      categoryFolders: folderIds
    };
  } catch (error) {
    console.error('Error creating folder structure:', error);
    throw error;
  }
};