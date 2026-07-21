interface EggFlagBadgeProps {
  containsEgg: boolean;
  className?: string;
}

export function EggFlagBadge({ containsEgg, className = '' }: EggFlagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        containsEgg ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
      } ${className}`}
    >
      {containsEgg ? 'Egg' : 'Eggless'}
    </span>
  );
}
