import { Star, Quote } from "lucide-react";

// Placeholder launch-copy testimonials — swap these for real customer reviews
// once the store has them. Kept generic (no fabricated specific claims/stats)
// since this is marketing copy, not data pulled from the reviews API.
const TESTIMONIALS = [
  {
    name: "Ananya R.",
    text: "The quality is genuinely better than I expected for the price. Packaging felt premium too — checkout was smooth.",
    rating: 5,
  },
  {
    name: "Karan M.",
    text: "Ordered a jacket and it fit true to size. Delivery was faster than the estimate, which was a nice surprise.",
    rating: 5,
  },
  {
    name: "Priya S.",
    text: "Customer support helped me swap a size within minutes on chat. That kind of responsiveness is rare.",
    rating: 4,
  },
];

const Testimonials = () => (
  <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
    <h2 className="section-title mb-8 text-center">What shoppers are saying</h2>
    <div className="grid sm:grid-cols-3 gap-5">
      {TESTIMONIALS.map((t) => (
        <div key={t.name} className="card p-6 relative">
          <Quote size={28} className="text-gray-100 absolute top-4 right-4" strokeWidth={1.5} />
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < t.rating ? "fill-gold text-gold" : "text-gray-200"} />
            ))}
          </div>
          <p className="text-sm text-ink/80 leading-relaxed mb-4">"{t.text}"</p>
          <p className="text-sm font-medium">{t.name}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials;
