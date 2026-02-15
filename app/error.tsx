'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md text-center space-y-4">
        <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
        <p className="text-gray-300 text-sm">
          An unexpected error occurred. Your session may still be active on the server.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors"
          >
            Reload page
          </button>
        </div>
        <p className="text-gray-500 text-xs">
          {error.message}
        </p>
      </div>
    </div>
  );
}
