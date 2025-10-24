import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportXML(
  xml: string,
  filename: string
): Promise<void> {
  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, xml, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

export async function exportJSON(
  data: object,
  filename: string
): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  } else {
    throw new Error('Sharing is not available on this device');
  }
}
