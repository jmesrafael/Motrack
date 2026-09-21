import { useState } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { makeStyles, typeStyle } from '@/theme/styles';

export interface ImageViewerModalProps {
  visible: boolean;
  /** Ready-to-render URIs (resolve relative storage paths via ImageStorage.uriFor before passing in). */
  images: readonly string[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    header: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.space.s4,
    },
    counter: typeStyle(t.type.bodyStrong, '#fff', t.type.family),
    page: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, alignItems: 'center', justifyContent: 'center' },
    image: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  }),
);

function ZoomableImage({ uri, onZoomChange }: { uri: string; onZoomChange: (zoomed: boolean) => void }) {
  const styles = useStyles();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const reset = () => {
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedX.value = 0;
    savedY.value = 0;
    onZoomChange(false);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        reset();
      } else {
        onZoomChange(true);
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (savedScale.value > 1) {
        translateX.value = savedX.value + e.translationX;
        translateY.value = savedY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > 1) {
        reset();
      } else {
        scale.value = withTiming(DOUBLE_TAP_SCALE);
        savedScale.value = DOUBLE_TAP_SCALE;
        onZoomChange(true);
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.Image source={{ uri }} style={[styles.image, style]} resizeMode="contain" />
    </GestureDetector>
  );
}

/**
 * Full-screen viewer (item 21): pinch-to-zoom, double-tap zoom, pan while
 * zoomed, swipe between images (paging disabled while the current page is
 * zoomed so the pan gesture isn't fought by the pager), safe-area-aware close
 * button and counter.
 */
export function ImageViewerModal({ visible, images, initialIndex = 0, onClose }: ImageViewerModalProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={[styles.header, { top: insets.top + 8 }]}>
          <IconButton icon="close" variant="glass" accessibilityLabel="Close" onPress={onClose} />
          {images.length > 1 ? (
            <Text style={styles.counter}>
              {index + 1} / {images.length}
            </Text>
          ) : (
            <View />
          )}
          <View style={{ width: 44 }} />
        </View>
        <ScrollView
          horizontal
          pagingEnabled
          scrollEnabled={!zoomed}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          contentOffset={{ x: initialIndex * SCREEN_WIDTH, y: 0 }}>
          {images.map((uri) => (
            <View key={uri} style={styles.page}>
              <ZoomableImage uri={uri} onZoomChange={setZoomed} />
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
