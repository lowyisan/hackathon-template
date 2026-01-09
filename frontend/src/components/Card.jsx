/**
 * Reusable Card container.
 * Provides a consistent background, border, and padding for grouping content.
 */
export function Card({ children }) {
  return (
    <div className="bg-surface border border-border rounded p-4">
      {children}
    </div>
  );
}
