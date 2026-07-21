import { NavLink } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`;

export function NavBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <NavLink to="/" className="truncate text-base font-semibold text-slate-900 sm:text-lg">
          🎂 Cake Cost Calculator
        </NavLink>
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          <NavLink to="/ingredients" className={linkClass}>
            Ingredients
          </NavLink>
          <NavLink to="/recipes" className={linkClass}>
            Recipes
          </NavLink>
          <NavLink to="/recipe-book" className={linkClass}>
            Recipe Book
          </NavLink>
          <NavLink to="/price-listing" className={linkClass}>
            Price Listing
          </NavLink>
          <NavLink to="/quotes" className={linkClass}>
            Quotes
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
          {user?.email && (
            <span className="hidden truncate text-sm text-slate-400 sm:inline">{user.email}</span>
          )}
          <button
            type="button"
            onClick={() => signOut()}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
