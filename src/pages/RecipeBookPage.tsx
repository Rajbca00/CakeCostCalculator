import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { Button } from '../components/common/Button';
import { TextInput } from '../components/common/TextInput';
import { Select } from '../components/common/Select';
import { RecipeBookRow } from '../components/recipes/RecipeBookRow';
import {
  useAppDataContext,
  useIngredientsById,
  useRecipes,
  useRecipesById,
  useSettings,
} from '../state/useAppData';
import { RECIPE_CATEGORIES, RECIPE_STATUSES, type Recipe, type RecipeCategory, type RecipeStatus } from '../types';

export function RecipeBookPage() {
  const navigate = useNavigate();
  const recipes = useRecipes();
  const recipesById = useRecipesById();
  const ingredientsById = useIngredientsById();
  const settings = useSettings();
  const { recipeVersions } = useAppDataContext();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RecipeCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<RecipeStatus | ''>('');

  const versionCountByRecipeId = useMemo(() => {
    const map = new Map<string, number>();
    recipeVersions.forEach((v) => map.set(v.recipeId, (map.get(v.recipeId) ?? 0) + 1));
    return map;
  }, [recipeVersions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recipes.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (statusFilter && (r.status ?? 'Draft') !== statusFilter) return false;
      return true;
    });
  }, [recipes, search, categoryFilter, statusFilter]);

  const filteredIds = useMemo(() => new Set(filtered.map((r) => r.id)), [filtered]);

  // A recipe nests under its parent only if that parent also survived the filter --
  // otherwise it's shown as its own top-level row so filtering never hides a match.
  const childrenByParentId = useMemo(() => {
    const map = new Map<string, Recipe[]>();
    filtered.forEach((r) => {
      if (!r.parentRecipeId || !filteredIds.has(r.parentRecipeId)) return;
      const arr = map.get(r.parentRecipeId) ?? [];
      arr.push(r);
      map.set(r.parentRecipeId, arr);
    });
    return map;
  }, [filtered, filteredIds]);

  const topLevel = useMemo(
    () => filtered.filter((r) => !r.parentRecipeId || !filteredIds.has(r.parentRecipeId)),
    [filtered, filteredIds],
  );

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Recipe[]>();
    topLevel.forEach((r) => {
      const key = r.category ?? 'Uncategorized';
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    });
    return map;
  }, [topLevel]);

  const categoryOrder = [...RECIPE_CATEGORIES, 'Uncategorized'].filter((c) =>
    groupedByCategory.has(c),
  );

  return (
    <PageContainer>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Recipe Book</h1>
        <Button onClick={() => navigate('/recipes/new')}>Add recipe</Button>
      </div>

      {recipes.length === 0 ? (
        <EmptyState
          title="No recipes yet"
          description="Add a recipe to see it here, grouped by category with its version and parent/child relationships."
          action={<Button onClick={() => navigate('/recipes/new')}>Add your first recipe</Button>}
        />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextInput
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
            />
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as RecipeCategory | '')}
            >
              <option value="">All categories</option>
              {RECIPE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RecipeStatus | '')}
            >
              <option value="">All statuses</option>
              {RECIPE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No recipes match"
              description="Try a different search term or clear the filters."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {categoryOrder.map((category) => (
                <div key={category}>
                  <h2 className="mb-2 text-sm font-semibold text-slate-800">{category}</h2>
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    {groupedByCategory.get(category)!.map((recipe) => (
                      <RecipeBookRow
                        key={recipe.id}
                        recipe={recipe}
                        depth={0}
                        childrenByParentId={childrenByParentId}
                        recipesById={recipesById}
                        ingredientsById={ingredientsById}
                        settings={settings}
                        versionCountByRecipeId={versionCountByRecipeId}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
