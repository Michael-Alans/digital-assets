/**
 * Mandatory Loading State Component
 * Used by SWR hooks and Protected route guards.
 */
export function LoadingState() {
  return (
    <div className="flex min-h-100 w-full flex-col items-center justify-center space-y-4 p-12">
      {/* Animated Spinner using your primary brand color */}
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm"></div>
      
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg font-semibold text-text-main animate-pulse">
          Loading assets...
        </p>
        <p className="text-sm text-muted">
          Fetching the best digital goods for you.
        </p>
      </div>
    </div>
  );
}