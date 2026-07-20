import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '../common/Button';
import { useAppDataContext } from '../../state/useAppData';
import { exportAppData, parseImportedAppData } from '../../lib/exportImport';
import { useToast } from './Toast';

/** Export/import the full backup — ingredients, recipes, and price listing menu items — as one JSON file. */
export function DataBackupControls() {
  const { replaceAllData, getSnapshot } = useAppDataContext();
  const { showToast } = useToast();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = parseImportedAppData(String(reader.result));
      if (!result.success || !result.data) {
        showToast(result.error ?? 'Import failed.', 'error');
        return;
      }
      const current = getSnapshot();
      const confirmed = window.confirm(
        `This will replace ${current.ingredients.length} ingredients, ${current.recipes.length} recipes, and ${current.priceListingVariants.length} menu items with ${result.data.ingredients.length} ingredients, ${result.data.recipes.length} recipes, and ${result.data.priceListingVariants.length} menu items from the file. Continue?`,
      );
      if (!confirmed) return;
      setImporting(true);
      try {
        await replaceAllData(result.data);
        showToast('Data imported successfully.', 'success');
      } catch {
        showToast('Import failed while saving to the server. Please try again.', 'error');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() => exportAppData(getSnapshot())}
        title="Exports ingredients, recipes, and price listing menu items into one JSON file"
      >
        Export all data
      </Button>
      <Button
        variant="secondary"
        onClick={handleImportClick}
        loading={importing}
        title="Imports ingredients, recipes, and price listing menu items from a JSON file"
      >
        Import all data
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  );
}
