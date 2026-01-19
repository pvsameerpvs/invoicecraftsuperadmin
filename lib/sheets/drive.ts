import { getDrive } from "@/lib/sheets/client";

/**
 * Duplicates a Google Drive file to a specific folder with a new name.
 * 
 * @param srcFileId - The ID of the file to copy.
 * @param destFolderId - The ID of the destination folder.
 * @param newFileName - The name for the new copy.
 * @returns The ID of the created file.
 */
export async function duplicateFile(
  srcFileId: string,
  destFolderId: string,
  newFileName: string
): Promise<string> {
  const drive = getDrive();

  try {
    const response = await drive.files.copy({
      fileId: srcFileId,
      supportsAllDrives: true,
      requestBody: {
        name: newFileName,
        parents: [destFolderId],
      },
      fields: "id", // Optimize by only requesting ID
    });

    const newFileId = response.data.id;
    if (!newFileId) {
      throw new Error(`Failed to duplicate file: No ID returned for ${newFileName}`);
    }

    return newFileId;
  } catch (error: any) {
    console.error("Error duplicating file:", error);
    throw new Error(`Drive duplicate failed: ${error.message || error}`);
  }
}
