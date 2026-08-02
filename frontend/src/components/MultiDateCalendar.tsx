import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Trash2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const COMMIT_PRESETS = [1, 3, 6, 10] as const;
export const MAX_TOTAL_COMMITS = 500;
export type CommitCount = (typeof COMMIT_PRESETS)[number];
export type DateCommitMap = Map<string, CommitCount>;

const LEVEL_STYLES: Record<CommitCount, string> = {
  1: "bg-commit-1 text-foreground border-foreground",
  3: "bg-commit-2 text-foreground border-foreground",
  6: "bg-commit-3 text-foreground border-foreground",
  10: "bg-commit-4 text-primary-foreground border-foreground",
};

interface MultiDateCalendarProps {
  selectedDates: DateCommitMap;
  onSelectedDatesChange: Dispatch<SetStateAction<DateCommitMap>>;
  clearAllDates: () => void;
  onSubmit?: (entries: Array<{ date: string; count: CommitCount }>) => void;
  isSubmitting?: boolean;
  focusDate?: string;
}

const MultiDateCalendar = ({
  selectedDates,
  onSelectedDatesChange,
  clearAllDates,
  onSubmit,
  isSubmitting = false,
  focusDate,
}: MultiDateCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  useEffect(() => {
    if (focusDate) setCurrentDate(new Date(`${focusDate}T12:00:00`));
  }, [focusDate]);

  const cycleDate = (dateString: string) => {
    onSelectedDatesChange((previous) => {
      const next = new Map(previous);
      const currentCount = next.get(dateString);
      const currentIndex = currentCount ? COMMIT_PRESETS.indexOf(currentCount) : -1;

      if (currentIndex === COMMIT_PRESETS.length - 1) {
        next.delete(dateString);
      } else {
        next.set(dateString, COMMIT_PRESETS[currentIndex + 1]);
      }

      return next;
    });
  };

  const setDateCount = (dateString: string, count: CommitCount | null) => {
    onSelectedDatesChange((previous) => {
      const next = new Map(previous);
      if (count === null) next.delete(dateString);
      else next.set(dateString, count);
      return next;
    });
  };

  const sortedEntries = Array.from(selectedDates.entries()).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  const totalCommits = sortedEntries.reduce((total, [, count]) => total + count, 0);
  const exceedsBatchLimit = totalCommits > MAX_TOTAL_COMMITS;

  const handleSubmit = () => {
    if (selectedDates.size === 0) return;
    onSubmit?.(sortedEntries.map(([date, count]) => ({ date, count })));
  };

  const formatDate = (dateString: string) =>
    new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-7 rounded-xl p-4 quirky-panel sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="hover:bg-primary/10 hover:text-primary"
            disabled={isSubmitting}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="-rotate-1 border-b-4 border-secondary text-lg font-extrabold text-foreground sm:text-xl">
            {MONTH_NAMES[month]} {year}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="hover:bg-primary/10 hover:text-primary"
            disabled={isSubmitting}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-primary py-2 font-mono">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const count = selectedDates.get(dateString);
            const isToday = isCurrentMonth && day === todayDate;

            return (
              <motion.button
                key={day}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                onClick={() => !isSubmitting && cycleDate(dateString)}
                disabled={isSubmitting}
                aria-label={`${dateString}: ${count ?? 0} commits. Click to change level.`}
                className={`relative flex aspect-square items-center justify-center rounded-md border-2 font-mono text-xs transition-all duration-150 sm:text-sm ${
                  count
                    ? LEVEL_STYLES[count]
                    : "border-foreground/30 bg-muted hover:-translate-y-0.5 hover:border-foreground hover:bg-secondary text-foreground"
                } ${isToday && !count ? "border-primary/60 font-semibold" : ""} ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {day}
                {count && (
                  <span className="absolute bottom-0.5 right-1 text-[8px] sm:text-[9px] font-bold leading-none">
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>whisper</span>
          <span className="h-5 w-5 rounded-sm border-2 border-foreground bg-muted" />
          {COMMIT_PRESETS.map((count) => (
            <button
              key={count}
              type="button"
              className={`h-5 min-w-5 rounded-sm border-2 px-1 text-[9px] font-bold ${LEVEL_STYLES[count]}`}
              title={`${count} commits`}
              disabled
            >
              {count}
            </button>
          ))}
          <span>shout</span>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Tap a square until the color feels right.
        </p>
      </div>

      <div className="mb-7 -rotate-[0.3deg] rounded-xl p-4 quirky-panel sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-xl font-extrabold text-foreground">Your tiny squares</h3>
          <span className="text-sm text-muted-foreground font-mono">
            {selectedDates.size} days · <span className="text-primary font-semibold">{totalCommits} commits</span>
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {sortedEntries.length === 0 ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground py-6 italic">
                No dates selected yet
              </motion.p>
            ) : (
              sortedEntries.map(([dateString, count]) => (
                <motion.div
                  key={dateString}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-3 rounded-md border-2 border-foreground bg-background px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-mono text-foreground">{formatDate(dateString)}</span>
                  <div className="flex items-center gap-1">
                    {COMMIT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDateCount(dateString, preset)}
                        disabled={isSubmitting}
                        aria-label={`Set ${dateString} to ${preset} commits`}
                        className={`h-8 min-w-8 rounded-md border px-2 text-xs font-bold transition-colors ${
                          count === preset ? LEVEL_STYLES[preset] : "border-foreground bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDateCount(dateString, null)}
                      className="h-8 w-8 ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isSubmitting}
                      aria-label={`Remove ${dateString}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="secondary" className="flex-1 font-semibold" onClick={clearAllDates} disabled={selectedDates.size === 0 || isSubmitting}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
        <Button
          variant="hero"
          className="flex-1 font-semibold"
          onClick={handleSubmit}
          disabled={selectedDates.size === 0 || isSubmitting || exceedsBatchLimit}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          {isSubmitting ? "Creating..." : `Create ${totalCommits}`}
        </Button>
      </div>

      {exceedsBatchLimit && (
        <p className="mt-3 text-center text-sm text-destructive">
          Reduce this batch to {MAX_TOTAL_COMMITS} commits or fewer.
        </p>
      )}

      {isSubmitting && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-sm text-muted-foreground">
          Creating Git commits. Keep this page open until the push finishes.
        </motion.p>
      )}
    </div>
  );
};

export default MultiDateCalendar;
