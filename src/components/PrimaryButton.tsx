import { Button } from '@/components/Button';
import type { IconName } from '@/components/Icon';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
}

/** Compatibility wrapper — the primary "next action" button (see Button). */
export function PrimaryButton({ label, onPress, loading = false, disabled = false, icon }: PrimaryButtonProps) {
  return (
    <Button
      label={label}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      {...(icon !== undefined ? { icon } : {})}
      variant="primary"
      size="lg"
    />
  );
}
