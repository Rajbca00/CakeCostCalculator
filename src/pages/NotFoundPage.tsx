import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer>
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-slate-800">Page not found</p>
        <Link to="/" className="mt-2 inline-block text-rose-600 hover:underline">
          Go home
        </Link>
      </div>
    </PageContainer>
  );
}
