/**
 * Mandatory Empty State Component
 * Used when API returns an empty array or 404.
 */
interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title = "No assets found", 
  message = "We couldn't find what you're looking for. Try adjusting your search or filters.",
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface/30 p-12 text-center">
      {/* Icon Placeholder */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface border border-border text-4xl grayscale opacity-50">
        📁
      </div>

      <h3 className="mb-2 text-xl font-bold text-text-main">
        {title}
      </h3>
      
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-8 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}