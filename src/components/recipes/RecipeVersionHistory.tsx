import type { RecipeStatus, RecipeVersion } from '../../types';

interface RecipeVersionHistoryProps {
  versions: RecipeVersion[];
  currentStatus: RecipeStatus;
}

/** Read-only list of past "Save new version" checkpoints, plus the live row shown as current. */
export function RecipeVersionHistory({ versions, currentStatus }: RecipeVersionHistoryProps) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {versions.length === 0 && (
        <p className="text-slate-400">
          No saved versions yet -- use "Save new version" to checkpoint this recipe.
        </p>
      )}
      {versions.map((v) => (
        <div
          key={v.id}
          className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5"
        >
          <span className="font-medium text-slate-800">v{v.versionNumber}</span>
          <span className="text-slate-500">{v.status}</span>
          <span className="text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5">
        <span className="font-medium text-rose-700">v{versions.length + 1}</span>
        <span className="text-rose-600">{currentStatus} (current)</span>
        <span className="text-rose-400">being edited</span>
      </div>
    </div>
  );
}
