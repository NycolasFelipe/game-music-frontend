/**
 * Formats a (possibly fractional) in-game year as a readable period. Whole
 * years are the first semester; `.5` fractions the second.
 */
export function formatPeriod(year: number): string {
  const calendarYear = Math.floor(year);
  const secondSemester = year % 1 !== 0;
  return `${calendarYear} · ${secondSemester ? "2º" : "1º"} semestre`;
}
