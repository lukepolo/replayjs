export default function escapeQuotes(value: string): string {
  return '"' + value.replace(/"/, '\\"') + '"';
}
