import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppDataProvider } from './state/AppDataContext';
import { AuthProvider } from './state/AuthContext';
import { ToastProvider } from './components/layout/Toast';
import { AuthGate } from './components/auth/AuthGate';
import { DataLoadingGate } from './components/layout/DataLoadingGate';
import { NavBar } from './components/layout/NavBar';
import { HomePage } from './pages/HomePage';
import { IngredientsPage } from './pages/IngredientsPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { PriceListingPage } from './pages/PriceListingPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthGate>
          <AppDataProvider>
            <DataLoadingGate>
              <HashRouter>
                <div className="min-h-screen bg-slate-50">
                  <NavBar />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/ingredients" element={<IngredientsPage />} />
                    <Route path="/recipes" element={<RecipesPage />} />
                    <Route path="/recipes/new" element={<RecipeDetailPage />} />
                    <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                    <Route path="/price-listing" element={<PriceListingPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </div>
              </HashRouter>
            </DataLoadingGate>
          </AppDataProvider>
        </AuthGate>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
