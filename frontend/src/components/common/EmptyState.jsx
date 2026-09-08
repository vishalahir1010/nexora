// A softer, more "designed" empty state — layered concentric circles with a
// gradient wash behind the icon, instead of a flat gray circle. Small touch,
// but it's the difference between "unstyled placeholder" and "considered".
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-4">
    {Icon && (
      <div className="relative h-24 w-24 mb-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-50" />
        <div className="absolute inset-3 rounded-full bg-white shadow-sm flex items-center justify-center">
          <Icon size={26} strokeWidth={1.75} className="text-ink/70" />
        </div>
      </div>
    )}
    <h3 className="text-lg font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1.5 text-sm text-muted max-w-sm">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
