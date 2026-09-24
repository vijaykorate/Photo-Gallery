// A piece of text that becomes an input while editing, and renders as plain
// text otherwise. Inherits the surrounding font/size via the passed className.
export default function EditableText({
  value,
  onChange,
  editing,
  placeholder = "",
  className = "",
  multiline = false,
  ariaLabel,
}) {
  if (!editing) {
    if (!value) return null;
    return <span className={className}>{value}</span>;
  }

  const common = {
    className: `editable ${multiline ? "editable--multiline" : ""} ${className}`,
    value: value || "",
    placeholder,
    "aria-label": ariaLabel || placeholder || "Edit text",
    onChange: (e) => onChange(e.target.value),
    // Don't let clicks bubble to parent handlers (e.g. opening the lightbox).
    onClick: (e) => e.stopPropagation(),
  };

  return multiline ? (
    <textarea {...common} rows={2} />
  ) : (
    <input type="text" {...common} />
  );
}
