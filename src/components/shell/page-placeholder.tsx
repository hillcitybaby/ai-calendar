/** Temporary body for screens that later milestones build out. */
export function PagePlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
