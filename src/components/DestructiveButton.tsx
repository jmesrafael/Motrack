import { Button, type ButtonSize } from '@/components/Button';

export interface DestructiveButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: ButtonSize;
}

/** Compatibility wrapper — irreversible actions (see Button). */
export function DestructiveButton({ label, onPress, disabled = false, size = 'md' }: DestructiveButtonProps) {
  return <Button label={label} onPress={onPress} disabled={disabled} variant="destructive" size={size} block />;
}
