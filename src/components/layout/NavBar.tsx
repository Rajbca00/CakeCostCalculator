import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`;

export function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="text-lg font-semibold text-slate-900">
          🎂 Cake Cost Calculator
        </NavLink>
        <nav className="flex gap-2">
          <NavLink to="/ingredients" className={linkClass}>
            Ingredients
          </NavLink>
          <NavLink to="/recipes" className={linkClass}>
            Recipes
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
