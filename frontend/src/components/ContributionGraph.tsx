import { motion } from "framer-motion";

const CONTRIBUTIONS = Array.from({ length: 52 }, (_, weekIndex) =>
  Array.from({ length: 7 }, (_, dayIndex) => {
    const value = ((weekIndex + 3) * 37 + (dayIndex + 5) * 17) % 100;
    let level = 0;
    if (value > 30) level = 1;
    if (value > 50) level = 2;
    if (value > 70) level = 3;
    if (value > 85) level = 4;
    if (weekIndex % 7 === 0 || (weekIndex > 20 && weekIndex < 25)) level = 0;
    return level;
  }),
);

const ContributionGraph = () => {
  const getLevelColor = (level: number) => {
    const colors = [
      "bg-commit-0",
      "bg-commit-1",
      "bg-commit-2",
      "bg-commit-3",
      "bg-commit-4",
    ];
    return colors[level] || colors[0];
  };

  return (
    <div className="relative overflow-hidden rounded-xl p-5 sm:p-6 quirky-panel">
      <div className="absolute -right-6 -top-7 rotate-6 border-2 border-foreground bg-accent px-8 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
        live-ish preview
      </div>

      <div className="relative flex justify-between gap-[3px] overflow-x-auto pb-2">
        {CONTRIBUTIONS.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((level, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: (weekIndex * 7 + dayIndex) * 0.002,
                  ease: "easeOut",
                }}
                className={`h-[11px] w-[11px] rounded-[2px] border border-foreground/20 ${getLevelColor(level)} transition-all duration-150 hover:scale-150 hover:border-foreground`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="relative mt-4 flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>quiet</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-[11px] w-[11px] rounded-sm ${getLevelColor(level)}`}
          />
        ))}
        <span>loud</span>
      </div>
    </div>
  );
};

export default ContributionGraph;
