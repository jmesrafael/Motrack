import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { SecondaryButton } from '@/components/SecondaryButton';
import { ImageStorage } from '@/services/imageStorage';
import { makeStyles } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface ImagesFieldProps {
  images: readonly string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  /** Opens the full-screen viewer at this index (item 21); omit to disable tap-to-zoom. */
  onViewImage?: (index: number) => void;
}

const THUMB_SIZE = 72;

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: { gap: t.space.s2 },
    thumbWrap: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: t.radius.md,
      overflow: 'hidden',
      backgroundColor: t.bg.surfaceVariant,
    },
    thumb: { width: '100%', height: '100%' },
    removeBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: t.bg.page,
      borderRadius: t.radius.full,
    },
    actions: { flexDirection: 'row', gap: t.space.s2, marginTop: t.space.s2 },
  }),
);

/**
 * Reusable multi-image attachment field (item 17, reused by Documents/Builds):
 * camera or library, JPEG re-encoded at 0.7 quality as the app's existing
 * compression convention (documents/new.tsx already uses this ImagePicker
 * `quality` option; no separate resize library is introduced), thumbnails
 * with remove, and an optional tap-to-zoom hook into the shared image viewer.
 */
export function ImagesField({ images, onChange, maxImages = 6, onViewImage }: ImagesFieldProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const canAddMore = images.length < maxImages;

  const addFromAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    const added = assets
      .slice(0, maxImages - images.length)
      .map((asset) => ImageStorage.importPickedImage(asset.uri, asset.fileName ?? 'photo.jpg'));
    if (added.length > 0) {
      onChange([...images, ...added]);
    }
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, maxImages - images.length),
    });
    if (!result.canceled) {
      addFromAssets(result.assets);
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      addFromAssets(result.assets);
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <View>
      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.row, { flexDirection: 'row' }]}>
            {images.map((path, index) => (
              <Pressable
                key={path}
                style={styles.thumbWrap}
                onPress={onViewImage !== undefined ? () => onViewImage(index) : undefined}
                accessibilityRole={onViewImage !== undefined ? 'imagebutton' : undefined}
                accessibilityLabel={`Image ${index + 1}`}>
                <Image source={{ uri: ImageStorage.uriFor(path) }} style={styles.thumb} resizeMode="cover" />
                <Pressable
                  style={styles.removeBadge}
                  onPress={() => removeAt(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove image ${index + 1}`}
                  hitSlop={8}>
                  <Icon name="minus" size={tokens.iconSize.md} color={tokens.feedback.error.base} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : null}
      {canAddMore ? (
        <View style={styles.actions}>
          <SecondaryButton
            label="Camera"
            icon="camera"
            block
            onPress={() => {
              void pickFromCamera();
            }}
          />
          <SecondaryButton
            label="Library"
            icon="image"
            block
            onPress={() => {
              void pickFromLibrary();
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
