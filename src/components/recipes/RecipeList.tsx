import type { Recipe } from '../../types';
import { RecipeCard } from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  onDelete: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, onDelete }: RecipeListProps) {
  return (
    <div className="flex flex-col gap-2">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onDelete={onDelete} />
      ))}
    </div>
  );
}
