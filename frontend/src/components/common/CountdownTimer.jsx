import { useEffect, useState } from "react";

const getTimeLeft = (endTime) => {
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: diff <= 0,
  };
};

// A real ticking countdown (setInterval-driven), not a static "24:00:00" mock.
const CountdownTimer = ({ endTime, dark = false }) => {
  const [time, setTime] = useState(() => getTimeLeft(endTime));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(endTime)), 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const pad = (n) => String(n).padStart(2, "0");
  const boxClass = dark
    ? "bg-white/10 text-white"
    : "bg-ink text-white";

  if (time.expired) {
    return <span className="text-sm font-medium">Sale has ended</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {[["H", time.hours], ["M", time.minutes], ["S", time.seconds]].map(([label, value]) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={`${boxClass} rounded-lg px-2.5 py-1.5 min-w-[2.5rem] text-center`}>
            <span className="text-sm font-semibold tabular-nums">{pad(value)}</span>
          </div>
          {label !== "S" && <span className="text-sm font-semibold opacity-50">:</span>}
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
