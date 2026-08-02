import { useState } from "react";
import { Heart, Laugh, Paintbrush, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COMMIT_PRESETS,
  MAX_TOTAL_COMMITS,
  type CommitCount,
  type DateCommitMap,
} from "@/components/MultiDateCalendar";
import {
  alignToSunday,
  defaultTemplateStartDate,
  getBuiltInPattern,
  patternToDateMap,
  sanitizeTemplateText,
  textToPattern,
} from "@/lib/patternTemplates";

type TemplateKind = "heart" | "smile" | "text";

interface TemplateStudioProps {
  onApply: (dates: DateCommitMap, focusDate: string) => void;
}

const TemplateStudio = ({ onApply }: TemplateStudioProps) => {
  const [kind, setKind] = useState<TemplateKind>("heart");
  const [text, setText] = useState("GCON");
  const [count, setCount] = useState<CommitCount>(3);
  const [startDate, setStartDate] = useState(() => defaultTemplateStartDate(8));

  const pattern = kind === "text" ? textToPattern(text) : getBuiltInPattern(kind);
  const pixelCount = pattern.reduce(
    (total, row) => total + row.filter(Boolean).length,
    0,
  );
  const totalCommits = pixelCount * count;
  const isTooLarge = totalCommits > MAX_TOTAL_COMMITS;

  const chooseTemplate = (nextKind: TemplateKind) => {
    const nextPattern =
      nextKind === "text" ? textToPattern(text) : getBuiltInPattern(nextKind);
    setKind(nextKind);
    setStartDate(defaultTemplateStartDate(nextPattern[0].length));
  };

  const updateText = (value: string) => {
    const nextText = sanitizeTemplateText(value);
    setText(nextText);
    setStartDate(defaultTemplateStartDate(textToPattern(nextText)[0].length));
  };

  const applyTemplate = () => {
    const alignedStart = alignToSunday(startDate);
    onApply(patternToDateMap(pattern, alignedStart, count), alignedStart);
  };

  return (
    <section className="mx-auto mb-10 max-w-3xl rounded-xl p-4 quirky-panel sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="sticker mb-3 bg-accent">Instant pixel art</span>
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            Stamp a pattern
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start with a shape or turn a short name into a 7-row contribution pattern.
          </p>
        </div>
        <Paintbrush className="hidden h-12 w-12 -rotate-12 text-primary sm:block" />
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {([
          ["heart", Heart, "Heart"],
          ["smile", Laugh, "Smile"],
          ["text", Type, "Word / name"],
        ] as const).map(([value, Icon, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => chooseTemplate(value)}
            className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border-2 border-foreground px-2 py-3 text-xs font-bold transition-all sm:flex-row sm:text-sm ${
              kind === value
                ? "-translate-y-1 bg-secondary shadow-[4px_4px_0_hsl(var(--foreground))]"
                : "bg-card hover:bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>

      {kind === "text" && (
        <label className="mb-5 block">
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Up to 8 letters or spaces
          </span>
          <input
            type="text"
            value={text}
            maxLength={8}
            onChange={(event) => updateText(event.target.value)}
            placeholder="YOUR NAME"
            className="h-12 w-full rounded-md border-2 border-foreground bg-background px-4 font-mono text-lg font-bold uppercase outline-none focus:bg-secondary/40 focus:ring-2 focus:ring-primary"
          />
        </label>
      )}

      <div className="mb-5 overflow-x-auto rounded-lg border-2 border-foreground bg-foreground p-4">
        <div
          className="mx-auto grid w-max gap-1"
          style={{ gridTemplateColumns: `repeat(${pattern[0].length}, 0.75rem)` }}
          aria-label={`${kind} contribution pattern preview`}
        >
          {pattern.flatMap((row, rowIndex) =>
            row.map((filled, columnIndex) => (
              <span
                key={`${rowIndex}-${columnIndex}`}
                className={`h-3 w-3 rounded-[2px] ${
                  filled ? "bg-commit-3" : "bg-card/15"
                }`}
              />
            )),
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Start in week containing
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-11 w-full rounded-md border-2 border-foreground bg-background px-3 font-mono text-sm font-bold outline-none focus:bg-secondary/40 focus:ring-2 focus:ring-primary"
          />
        </label>

        <div>
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Commits per filled square
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {COMMIT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCount(preset)}
                className={`h-11 rounded-md border-2 border-foreground font-mono text-sm font-bold ${
                  count === preset ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className={`font-mono text-xs ${isTooLarge ? "text-destructive" : "text-muted-foreground"}`}>
          {pixelCount} squares × {count} = <strong>{totalCommits} commits</strong>
          {isTooLarge ? ` · limit is ${MAX_TOTAL_COMMITS}` : ""}
        </p>
        <Button variant="hero" onClick={applyTemplate} disabled={isTooLarge || !startDate}>
          <Paintbrush className="h-4 w-4" />
          Stamp pattern
        </Button>
      </div>

      <p className="mt-4 border-t-2 border-dashed border-foreground/30 pt-3 text-xs text-muted-foreground">
        Stamping replaces the current selection. You can fine-tune every square in the calendar afterward.
      </p>
    </section>
  );
};

export default TemplateStudio;
