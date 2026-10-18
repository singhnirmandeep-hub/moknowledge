import Link from "next/link";

export default function PageHeader() {
  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/knowledge" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-lg font-black text-white ring-1 ring-white/30">
            M
          </span>
          <span className="text-xl font-bold tracking-tight text-white">MoKnowledge</span>
        </Link>

        <nav className="flex gap-2 text-sm font-medium">
          <Link
            href="/knowledge"
            className="rounded-full px-4 py-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            Build
          </Link>
          <Link
            href="/knowledge/view"
            className="rounded-full bg-white/20 px-4 py-1.5 text-white ring-1 ring-white/30 transition hover:bg-white/30"
          >
            View Records
          </Link>
        </nav>
      </div>
    </header>
  );
}