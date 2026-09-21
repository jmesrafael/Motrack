import { Button, type ButtonSize } from '@/components/Button';
import type { IconName } from '@/components/Icon';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  /** Default 'lg' preserves every existing call site; pass 'md' to match a sibling in the same row (e.g. next to a Delete/Cancel button). */
  size?: ButtonSize;
  block?: boolean;
}

/** Compatibility wrapper — the primary "next action" button (see Button). */
export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  size = 'lg',
  block,
}: PrimaryButtonProps) {
  return (
    <Button
      label={label}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      {...(icon !== undefined ? { icon } : {})}
      {...(block !== undefined ? { block } : {})}
      variant="primary"
      size={size}
    />
  );
}
