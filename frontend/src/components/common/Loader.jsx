const Loader = ({ full = false }) => (
  <div className={full ? "min-h-[60vh] flex items-center justify-center" : "flex items-center justify-center py-10"}>
    <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-ink animate-spin" />
  </div>
);

export default Loader;
