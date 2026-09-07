// Native (iOS / Android) backup file handling.
// The web build resolves `backup.web.js` instead — Metro picks the platform
// suffix automatically.
//
// NOTE: expo-file-system v19 (SDK 54) moved `cacheDirectory`, `EncodingType`,
// `writeAsStringAsync` and `readAsStringAsync` behind the `/legacy` entry point.
// Importing them from `expo-file-system` directly throws at runtime.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

/**
 * Writes the backup to a cache file and hands it to the OS share sheet.
 * @returns {Promise<'saved'|'unavailable'>}
 */
export async function saveBackup(filename, payload) {
  const fileUri = FileSystem.cacheDirectory + filename;

  await FileSystem.writeAsStringAsync(fileUri, payload, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await Sharing.isAvailableAsync())) {
    return 'unavailable';
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Save TrackFitness Backup',
    UTI: 'public.json',
  });

  return 'saved';
}

/**
 * Opens the document picker and reads the chosen JSON file.
 * @returns {Promise<{ canceled: boolean, contents?: string }>}
 */
export async function pickBackupJson() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'public.json', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) {
    return { canceled: true };
  }

  const contents = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return { canceled: false, contents };
}
