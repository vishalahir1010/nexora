import { AlertTriangle, RefreshCw } from "lucide-react";

const ErrorState = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-4">
    <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <AlertTriangle size={28} className="text-accent" />
    </div>
    <h3 className="text-lg font-semibold text-ink">We hit a snag</h3>
    <p className="mt-1.5 text-sm text-muted max-w-sm">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary mt-6">
        <RefreshCw size={15} /> Try again
      </button>
    )}
  </div>
);

export default ErrorState;
