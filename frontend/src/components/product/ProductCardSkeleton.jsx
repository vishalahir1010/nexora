const ProductCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden">
    <div className="skeleton aspect-[3/4] rounded-2xl" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  </div>
);

export default ProductCardSkeleton;
