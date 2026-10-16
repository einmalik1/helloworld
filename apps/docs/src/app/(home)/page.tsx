import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">Hello World Docs</h1>
      <p className="mb-6 max-w-xl text-fd-muted-foreground">
        Publishes product SoT from repo <code className="text-sm">openspec/</code> — features,
        decisions, architecture, and tech-stack.
      </p>
      <Link href="/docs" className="font-medium underline underline-offset-4">
        Open documentation
      </Link>
    </div>
  );
}
