import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { reviewService } from "../../services/reviewService.js";
import { getErrorMessage } from "../../services/api.js";
import { useAuth } from "../../hooks/useAuth.js";
import RatingStars from "../../components/common/RatingStars.jsx";
import { formatDate } from "../../utils/format.js";

const ReviewSection = ({ productId, ratingBreakdown = {}, rating, numReviews }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const loadReviews = () => {
    reviewService.getProductReviews(productId).then((res) => setReviews(res.data.data.reviews));
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const onSubmit = async (data) => {
    try {
      await reviewService.createReview({ productId, rating: Number(data.rating), title: data.title, comment: data.comment });
      toast.success("Review submitted");
      reset();
      setShowForm(false);
      loadReviews();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-gray-100">
      <h2 className="section-title mb-6">Customer Reviews</h2>

      <div className="grid md:grid-cols-3 gap-8 mb-10">
        <div className="text-center md:text-left">
          <p className="text-4xl font-semibold">{rating?.toFixed(1) || "0.0"}</p>
          <RatingStars rating={rating} size={16} />
          <p className="text-sm text-muted mt-1">{numReviews} reviews</p>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown[star] || 0;
            const pct = numReviews ? Math.round((count / numReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-8">{star}★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-muted text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {isAuthenticated && (
        <div className="mb-8">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="btn-secondary">Write a Review</button>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="border border-gray-200 rounded-2xl p-5 space-y-3 max-w-lg">
              <select {...register("rating", { required: true })} className="input-field" defaultValue="5">
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
              </select>
              <input placeholder="Review title" className="input-field" {...register("title")} />
              <textarea placeholder="Share your experience..." rows={4} className="input-field" {...register("comment", { required: true })} />
              <p className="text-xs text-muted">Only customers with a delivered order for this product can review it.</p>
              <div className="flex gap-2">
                <button type="submit" disabled={isSubmitting} className="btn-primary">Submit Review</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 && <p className="text-sm text-muted">No reviews yet. Be the first to review this product.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{r.user?.name}</span>
                {r.verifiedPurchase && (
                  <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Verified Purchase</span>
                )}
              </div>
              <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
            </div>
            <RatingStars rating={r.rating} size={13} />
            {r.title && <p className="font-medium text-sm mt-1.5">{r.title}</p>}
            <p className="text-sm text-muted mt-1 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewSection;
