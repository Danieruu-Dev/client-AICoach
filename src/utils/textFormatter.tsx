export function toProperCase(value: string): string {
  if (!value) return value;

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function formatExperience(value: string): string {
  const numberMap: Record<string, string> = {
    zero: "0",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    ten: "10",
    less: "Less",
    than: "than",
    months: "Months",
    month: "Month",
    year: "Year",
    years: "Years",
    to: "-",
    plus: "+",
  };

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) => numberMap[word] ?? word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+\+/g, "+");
}
