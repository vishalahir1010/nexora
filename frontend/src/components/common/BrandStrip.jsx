import { Link } from "react-router-dom";

const BrandStrip = ({ brands }) => {
  if (!brands || brands.length === 0) return null;
  return (
    <section className="border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <p className="text-xs font-medium text-muted uppercase tracking-wider text-center mb-5">
          Brands you'll love
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {brands.slice(0, 10).map((b) => (
            <Link
              key={b._id}
              to={`/shop?brand=${b._id}`}
              className="text-sm font-display font-semibold text-ink/50 hover:text-ink transition-colors"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandStrip;
