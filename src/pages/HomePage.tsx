import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';

export function HomePage() {
  return (
    <PageContainer>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Cake Cost Calculator</h1>
        <p className="text-slate-600">
          Track what you pay for ingredients, then cost out your cake recipes automatically —
          and see the cost for any batch size.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link to="/ingredients">
            <Button variant="secondary">Manage ingredients</Button>
          </Link>
          <Link to="/recipes">
            <Button>Manage recipes</Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
