import type { Recipe } from '../../types';
import { RecipeCard } from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  onClone: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, onClone, onDelete }: RecipeListProps) {
  return (
    <div className="flex flex-col gap-2">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onClone={onClone} onDelete={onDelete} />
      ))}
    </div>
  );
}
