interface RecipeGroupFilterProps {
  groups: string[];
  selectedGroups: Set<string>;
  onChange: (next: Set<string>) => void;
}

export function RecipeGroupFilter({ groups, selectedGroups, onChange }: RecipeGroupFilterProps) {
  function toggle(group: string) {
    const next = new Set(selectedGroups);
    if (next.has(group)) {
      next.delete(group);
    } else {
      next.add(group);
    }
    onChange(next);
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="mb-2 text-sm font-semibold text-slate-800">Include groups</p>
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => {
          const active = selectedGroups.has(group);
          return (
            <button
              key={group}
              type="button"
              onClick={() => toggle(group)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                active
                  ? 'border-rose-600 bg-rose-600 text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {group}
            </button>
          );
        })}
      </div>
    </div>
  );
}
