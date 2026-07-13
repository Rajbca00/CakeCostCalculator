import { useState } from 'react';
import { Select } from '../common/Select';
import { TextInput } from '../common/TextInput';

const NEW_GROUP_VALUE = '__new__';

interface GroupSelectProps {
  value: string | undefined;
  groupOptions: string[];
  onChange: (groupName: string | undefined) => void;
  className?: string;
}

export function GroupSelect({ value, groupOptions, onChange, className }: GroupSelectProps) {
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');

  function commit() {
    const trimmed = draftName.trim();
    setCreating(false);
    setDraftName('');
    if (trimmed) onChange(trimmed);
  }

  if (creating) {
    return (
      <TextInput
        label="New group name"
        value={draftName}
        autoFocus
        onChange={(e) => setDraftName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setCreating(false);
            setDraftName('');
          }
        }}
        className={className}
      />
    );
  }

  return (
    <Select
      label="Group"
      value={value ?? ''}
      onChange={(e) => {
        if (e.target.value === NEW_GROUP_VALUE) {
          setCreating(true);
        } else {
          onChange(e.target.value || undefined);
        }
      }}
      className={className}
    >
      <option value="">Ungrouped</option>
      {groupOptions.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
      <option value={NEW_GROUP_VALUE}>+ New group…</option>
    </Select>
  );
}
