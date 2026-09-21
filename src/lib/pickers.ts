/**
 * The one place that calls expo-image-picker/expo-document-picker directly.
 * ImagesField, the Documents screens, and anything else that needs to pick a
 * photo/file share these instead of each re-implementing camera/library/file
 * pickers with their own copy of the permission-check and asset-mapping
 * boilerplate.
 */

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export interface PickedAsset {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

const IMAGE_QUALITY = 0.7;

function fromImagePickerAsset(asset: ImagePicker.ImagePickerAsset): PickedAsset {
  return {
    uri: asset.uri,
    name: asset.fileName ?? 'photo.jpg',
    mimeType: asset.mimeType ?? 'image/jpeg',
    size: asset.fileSize ?? 0,
  };
}

/** Library picker; pass `allowsMultipleSelection` to let the user pick more than one, and `selectionLimit` to cap it in the OS picker itself. */
export async function pickImagesFromLibrary(
  options: { allowsMultipleSelection?: boolean; selectionLimit?: number } = {},
): Promise<PickedAsset[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    quality: IMAGE_QUALITY,
    allowsMultipleSelection: options.allowsMultipleSelection ?? false,
    ...(options.selectionLimit !== undefined ? { selectionLimit: options.selectionLimit } : {}),
  });
  return result.canceled ? [] : result.assets.map(fromImagePickerAsset);
}

export type CameraPickResult =
  | { status: 'captured'; asset: PickedAsset }
  | { status: 'cancelled' }
  | { status: 'permissionDenied' };

/** Camera capture; distinguishes "user cancelled" (expected, no error needed) from "permission denied" (worth telling them). */
export async function pickImageFromCamera(): Promise<CameraPickResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { status: 'permissionDenied' };
  }
  const result = await ImagePicker.launchCameraAsync({ quality: IMAGE_QUALITY });
  if (result.canceled || result.assets[0] === undefined) {
    return { status: 'cancelled' };
  }
  return { status: 'captured', asset: fromImagePickerAsset(result.assets[0]) };
}

/** Any file type (PDFs, etc.); resolves to null when cancelled. */
export async function pickAnyFile(): Promise<PickedAsset | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
  if (result.canceled || result.assets[0] === undefined) {
    return null;
  }
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? 'application/octet-stream',
    size: asset.size ?? 0,
  };
}
