import { useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { TextField } from '@/components/TextField';
import { normalizeForCompare } from '@/lib/format';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface SearchOrAddOption {
  value: string;
  label: string;
}

export interface SearchOrAddProps {
  options: readonly SearchOrAddOption[];
  /** Currently chosen value; used only to seed the field's display text. */
  value: string | null;
  /** An existing option was tapped. */
  onSelect: (value: string) => void;
  /** The Add button was pressed with a normalized, non-duplicate label. */
  onAdd: (label: string) => void;
  placeholder: string;
  addLabel?: string;
  duplicateLabel?: string;
  maxResultsHeight?: number;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: t.space.s2 },
    input: { flex: 1 },
    results: {
      marginTop: t.space.s2,
      borderRadius: t.radius.md,
      backgroundColor: t.bg.surfaceVariant,
      overflow: 'hidden',
    },
    resultRow: {
      minHeight: t.size.buttonMd,
      paddingHorizontal: t.space.s4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border.divider,
    },
    resultText: typeStyle(t.type.body, t.text.primary),
    empty: {
      paddingHorizontal: t.space.s4,
      paddingVertical: t.space.s3,
    },
    emptyText: typeStyle(t.type.caption, t.text.secondary),
    duplicateHint: {
      ...typeStyle(t.type.caption, t.feedback.warning.base),
      marginTop: t.space.s1,
    },
  }),
);

/**
 * One reusable search-or-create field (item 14): live-filters `options` as
 * the user types, offers an Add button for a new, normalized, non-duplicate
 * value, and disables Add with an explanation when the typed text already
 * matches an existing option (trim + collapse whitespace + case-insensitive).
 * Used for expense categories, custom components, and every component
 * picker — never a one-off per screen.
 */
export function SearchOrAdd({
  options,
  value,
  onSelect,
  onAdd,
  placeholder,
  addLabel = 'Add',
  duplicateLabel = 'Already in your list',
  maxResultsHeight = 220,
}: SearchOrAddProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';
  const [query, setQuery] = useState(selectedLabel);
  const [focused, setFocused] = useState(false);
  const [syncedLabel, setSyncedLabel] = useState(selectedLabel);

  // Keep the field's text in sync with an externally-changed selection (e.g.
  // parent re-selects after a successful add) without fighting live typing.
  // Adjusting state during render (not an effect) per React's guidance for
  // "state that depends on a prop" — no extra commit, no flash of stale text.
  if (!focused && selectedLabel !== syncedLabel) {
    setSyncedLabel(selectedLabel);
    setQuery(selectedLabel);
  }

  const normalizedQuery = normalizeForCompare(query);
  const filtered =
    normalizedQuery === ''
      ? options
      : options.filter((o) => normalizeForCompare(o.label).includes(normalizedQuery));
  const exactMatch = options.find((o) => normalizeForCompare(o.label) === normalizedQuery);
  const canAdd = normalizedQuery !== '' && exactMatch === undefined;
  const showResults = focused;

  const selectOption = (option: SearchOrAddOption) => {
    onSelect(option.value);
    setQuery(option.label);
    setFocused(false);
    Keyboard.dismiss();
  };

  const handleAdd = () => {
    if (!canAdd) {
      return;
    }
    const normalized = query.trim().replace(/\s+/g, ' ');
    onAdd(normalized);
    setFocused(false);
    Keyboard.dismiss();
  };

  return (
    <View>
      <View style={styles.row}>
        <TextField
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <IconButton
          icon="plus"
          variant={canAdd ? 'accent' : 'surface'}
          accessibilityLabel={addLabel}
          onPress={handleAdd}
        />
      </View>
      {normalizedQuery !== '' && exactMatch !== undefined && focused ? (
        <Text style={styles.duplicateHint}>{duplicateLabel}</Text>
      ) : null}
      {showResults ? (
        <View style={styles.results}>
          <ScrollView style={{ maxHeight: maxResultsHeight }} keyboardShouldPersistTaps="handled">
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No matches. Type a name and tap + to add it.</Text>
              </View>
            ) : (
              filtered.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => selectOption(option)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.resultRow, pressed && { opacity: 0.7 }]}>
                  <Text style={styles.resultText}>{option.label}</Text>
                  {option.value === value ? (
                    <Icon name="check" size={tokens.iconSize.inline} color={tokens.primary.text} />
                  ) : null}
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
