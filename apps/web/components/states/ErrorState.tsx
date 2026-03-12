/**
 * Mandatory Error State Component
 * Used when API calls fail or 500 errors occur.
 */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We encountered an error while fetching the data. Please try again or contact support if the issue persists.",
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex min-h-100 w-full flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/30 p-12 text-center">
      {/* Error Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 text-4xl">
        ⚠️
      </div>

      <h3 className="mb-2 text-xl font-bold text-text-main">
        {title}
      </h3>
      
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-8 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-95 shadow-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}