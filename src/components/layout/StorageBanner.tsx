import { useAppDataContext } from '../../state/useAppData';

export function StorageBanner() {
  const { storageAvailable, saveFailed } = useAppDataContext();

  if (storageAvailable && !saveFailed) return null;

  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-800">
      {!storageAvailable
        ? "Local storage isn't available in this browser — changes won't be saved automatically. Use Export on the Ingredients or Recipes page to back up your data."
        : "Couldn't save your latest change — storage may be full. Export your data to avoid losing it."}
    </div>
  );
}
