import { motion } from "framer-motion";
import { useMemo } from "react";

const ContributionGraph = () => {
  // Generate a sample contribution pattern (52 weeks x 7 days)
  const contributions = useMemo(() => {
    const weeks = 52;
    const days = 7;
    const data: number[][] = [];

    for (let w = 0; w < weeks; w++) {
      const week: number[] = [];
      for (let d = 0; d < days; d++) {
        // Create a pattern that looks natural but has some gaps
        const random = Math.random();
        let level = 0;
        if (random > 0.3) level = 1;
        if (random > 0.5) level = 2;
        if (random > 0.7) level = 3;
        if (random > 0.85) level = 4;
        // Add some intentional gaps
        if (w % 7 === 0 || (w > 20 && w < 25)) level = 0;
        week.push(level);
      }
      data.push(week);
    }
    return data;
  }, []);

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
        {contributions.map((week, weekIndex) => (
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
