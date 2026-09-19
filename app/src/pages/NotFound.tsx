import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Best Travel Morocco</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-bold text-[#C9A96E] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist. It may have been moved or removed.
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-[#C9A96E] text-white rounded-lg hover:bg-[#b8954f] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/tours"
            className="px-6 py-3 border border-[#C9A96E] text-[#C9A96E] rounded-lg hover:bg-[#C9A96E] hover:text-white transition-colors"
          >
            Browse Tours
          </Link>
        </div>
      </div>
    </>
  );
}
