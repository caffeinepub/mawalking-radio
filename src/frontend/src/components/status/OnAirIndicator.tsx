export default function OnAirIndicator() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
    </span>
  );
}
