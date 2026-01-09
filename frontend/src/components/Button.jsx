/**
 * Reusable Button component.
 * Applies standard application styling (primary color, hover effects, etc.).
 * Accepts all standard HTML button attributes via props.
 */
export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded bg-primary hover:bg-primaryHover text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
