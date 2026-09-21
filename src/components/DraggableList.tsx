import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { makeStyles } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface DraggableListProps<T> {
  data: readonly T[];
  keyExtractor: (item: T) => string;
  /** Every row must be this tall — keeps the drag-distance-to-slot math simple and predictable. */
  itemHeight: number;
  renderItem: (item: T) => React.ReactNode;
  onReorder: (next: T[]) => void;
  disabled?: boolean;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    content: { flex: 1 },
    handle: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

/**
 * Long-press-free, handle-only drag reorder (item 13): the handle icon is the
 * only pan target, so it never fights the enclosing screen's scroll gesture
 * or the row's own tap-to-edit. Every row is a fixed height so the drop slot
 * is just round(translationY / itemHeight) — no live-measured layout, no
 * reflow animation of siblings, just a snap to the new order on release.
 */
export function DraggableList<T>({
  data,
  keyExtractor,
  itemHeight,
  renderItem,
  onReorder,
  disabled = false,
}: DraggableListProps<T>) {
  const reorder = (fromIndex: number, toIndex: number) => {
    const next = [...data];
    const [moved] = next.splice(fromIndex, 1);
    if (moved !== undefined) {
      next.splice(toIndex, 0, moved);
    }
    onReorder(next);
  };

  return (
    <View>
      {data.map((item, index) => (
        <DraggableRow
          key={keyExtractor(item)}
          index={index}
          itemHeight={itemHeight}
          maxIndex={data.length - 1}
          disabled={disabled}
          onDrop={reorder}>
          {renderItem(item)}
        </DraggableRow>
      ))}
    </View>
  );
}

function DraggableRow({
  index,
  itemHeight,
  maxIndex,
  disabled,
  onDrop,
  children,
}: {
  index: number;
  itemHeight: number;
  maxIndex: number;
  disabled: boolean;
  onDrop: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
}) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const translateY = useSharedValue(0);
  const active = useSharedValue(0);

  const drop = (toIndex: number) => onDrop(index, toIndex);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      active.value = 1;
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      const moveBy = Math.round(translateY.value / itemHeight);
      const toIndex = Math.min(Math.max(index + moveBy, 0), maxIndex);
      translateY.value = withSpring(0, { damping: 20, stiffness: 250 });
      active.value = 0;
      if (toIndex !== index) {
        runOnJS(drop)(toIndex);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: active.value === 1 ? 1.02 : 1 }],
    zIndex: active.value === 1 ? 10 : 0,
    shadowOpacity: active.value === 1 ? 0.2 : 0,
    elevation: active.value === 1 ? 4 : 0,
  }));

  return (
    <Animated.View style={[styles.row, { height: itemHeight }, rowStyle]}>
      <View style={styles.content}>{children}</View>
      <GestureDetector gesture={pan}>
        <View
          style={styles.handle}
          accessibilityRole="adjustable"
          accessibilityLabel="Drag to reorder">
          <Icon name="dragHandle" size={tokens.iconSize.md} color={tokens.icon.secondary} />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}
