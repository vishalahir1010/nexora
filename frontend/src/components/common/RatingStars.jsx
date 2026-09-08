import { Star } from "lucide-react";

const RatingStars = ({ rating = 0, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={size} className={n <= Math.round(rating) ? "fill-gold text-gold" : "text-gray-300"} />
    ))}
  </div>
);

export default RatingStars;
