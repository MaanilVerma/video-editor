export function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-[#0A0A0B]">
      <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 via-transparent to-transparent" />
    </div>
  );
}
