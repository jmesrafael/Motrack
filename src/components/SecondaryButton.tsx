import { Button, type ButtonSize } from '@/components/Button';
import type { IconName } from '@/components/Icon';

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  size?: ButtonSize;
  block?: boolean;
}

/** Compatibility wrapper — the alternative action (see Button). */
export function SecondaryButton({ label, onPress, icon, size = 'md', block }: SecondaryButtonProps) {
  return (
    <Button
      label={label}
      onPress={onPress}
      {...(icon !== undefined ? { icon } : {})}
      {...(block !== undefined ? { block } : {})}
      variant="secondary"
      size={size}
    />
  );
}
