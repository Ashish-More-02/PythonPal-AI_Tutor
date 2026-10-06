import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaFire } from "react-icons/fa";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Local-date key ("YYYY-MM-DD") in the user's timezone.
const toKey = (d) => d.toLocaleDateString("en-CA");

// Placeholder until daily-login tracking exists. The shape is ready for it:
// pass `activeDays` as date keys and `streak`/`longestStreak` as numbers, and
// those days turn green.
const StreakCalendar = ({ isDarkMode, activeDays = [], streak = 0, longestStreak = 0 }) => {
  const today = new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const active = new Set(activeDays);
  const todayKey = toKey(today);
  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  // getDay() is Sunday-first; the grid is Monday-first.
  const leadingBlanks = (month.getDay() + 6) % 7;
  const cells = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];

  const shiftMonth = (delta) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const card = `rounded-2xl border p-5 ${isDarkMode ? "bg-gray-900/70 border-gray-800" : "bg-white border-gray-200"}`;
  const muted = isDarkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-4">
      {/* streak counter */}
      <div className={`${card} relative overflow-hidden`}>
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <p className="text-sm font-semibold">Daily streak</p>
          <span className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
            Coming soon
          </span>
        </div>
        <div className="relative mt-3 flex items-center gap-3">
          <span className={`h-12 w-12 rounded-2xl flex items-center justify-center ${streak > 0 ? "bg-orange-500/15 text-orange-500" : isDarkMode ? "bg-gray-800 text-gray-600" : "bg-gray-100 text-gray-400"}`}>
            <FaFire size={22} />
          </span>
          <div>
            <p className="text-3xl font-bold leading-none">
              {streak} <span className={`text-base font-medium ${muted}`}>{streak === 1 ? "day" : "days"}</span>
            </p>
            <p className={`text-xs mt-1 ${muted}`}>Longest: {longestStreak} {longestStreak === 1 ? "day" : "days"}</p>
          </div>
        </div>
      </div>

      {/* month grid */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
          <div className="flex gap-1">
            <button onClick={() => shiftMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-500/20 cursor-pointer" aria-label="Previous month">
              <FiChevronLeft size={16} />
            </button>
            {/* no point browsing future months */}
            <button
              onClick={() => shiftMonth(1)}
              disabled={isCurrentMonth}
              className="p-1.5 rounded-lg hover:bg-gray-500/20 cursor-pointer disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent"
              aria-label="Next month"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className={`mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-medium ${muted}`}>
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} />;
            const key = toKey(date);
            const isActive = active.has(key);
            const isToday = key === todayKey;
            const isFuture = date > today;
            return (
              <span
                key={key}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs transition-colors ${
                  isActive
                    ? "bg-emerald-500 text-white font-semibold"
                    : isToday
                    ? "ring-2 ring-emerald-500 font-semibold"
                    : isFuture
                    ? isDarkMode ? "text-gray-700" : "text-gray-300"
                    : isDarkMode ? "bg-gray-800/60 text-gray-400" : "bg-gray-100 text-gray-500"
                }`}
              >
                {date.getDate()}
              </span>
            );
          })}
        </div>

        <div className={`mt-4 flex items-center gap-4 text-[11px] ${muted}`}>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Practised
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm ring-2 ring-emerald-500" /> Today
          </span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
