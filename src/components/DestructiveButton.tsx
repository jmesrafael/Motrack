import { Button, type ButtonSize } from '@/components/Button';

export interface DestructiveButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: ButtonSize;
  /** Full-width by default (matches every standalone "Delete X" call site); pass false when it sits beside another button in a row so both keep the same natural height instead of one stretching taller. */
  block?: boolean;
}

/** Compatibility wrapper — irreversible actions (see Button). */
export function DestructiveButton({
  label,
  onPress,
  disabled = false,
  size = 'md',
  block = true,
}: DestructiveButtonProps) {
  return <Button label={label} onPress={onPress} disabled={disabled} variant="destructive" size={size} block={block} />;
}
