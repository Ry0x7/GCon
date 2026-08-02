import type { CommitCount, DateCommitMap } from "@/components/MultiDateCalendar";

export type PixelPattern = boolean[][];

const GLYPHS: Record<string, number[]> = {
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [15, 16, 16, 16, 16, 16, 15],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [15, 16, 16, 23, 17, 17, 15],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [31, 4, 4, 4, 4, 4, 31],
  J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 27, 17],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
  " ": [0, 0, 0, 0, 0, 0, 0],
};

const BUILT_IN_PATTERNS = {
  heart: [
    "01100110",
    "11111111",
    "11111111",
    "01111110",
    "00111100",
    "00011000",
    "00000000",
  ],
  smile: [
    "0111110",
    "1000001",
    "1010101",
    "1000001",
    "1011101",
    "1000001",
    "0111110",
  ],
} as const;

const rowsToPattern = (rows: readonly string[]): PixelPattern =>
  rows.map((row) => Array.from(row, (pixel) => pixel === "1"));

export const getBuiltInPattern = (name: "heart" | "smile") =>
  rowsToPattern(BUILT_IN_PATTERNS[name]);

export const sanitizeTemplateText = (value: string) =>
  value.toUpperCase().replace(/[^A-Z ]/g, "").replace(/\s+/g, " ").slice(0, 8);

export const textToPattern = (value: string): PixelPattern => {
  const text = sanitizeTemplateText(value).trim() || "GCON";

  return Array.from({ length: 7 }, (_, rowIndex) => {
    const row: boolean[] = [];
    Array.from(text).forEach((character, characterIndex) => {
      const glyph = GLYPHS[character] ?? GLYPHS[" "];
      for (let bit = 4; bit >= 0; bit -= 1) {
        row.push(Boolean(glyph[rowIndex] & (1 << bit)));
      }
      if (characterIndex < text.length - 1) row.push(false);
    });
    return row;
  });
};

const formatLocalDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const alignToSunday = (dateString: string) => {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() - date.getDay());
  return formatLocalDate(date);
};

export const defaultTemplateStartDate = (patternWidth = 8) => {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() - patternWidth * 7);
  return formatLocalDate(date);
};

export const patternToDateMap = (
  pattern: PixelPattern,
  startDate: string,
  count: CommitCount,
): DateCommitMap => {
  const firstSunday = new Date(`${alignToSunday(startDate)}T12:00:00`);
  const dates: DateCommitMap = new Map();

  pattern.forEach((row, dayOfWeek) => {
    row.forEach((isFilled, weekIndex) => {
      if (!isFilled) return;
      const date = new Date(firstSunday);
      date.setDate(date.getDate() + weekIndex * 7 + dayOfWeek);
      dates.set(formatLocalDate(date), count);
    });
  });

  return dates;
};
