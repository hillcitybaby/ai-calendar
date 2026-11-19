"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Segmented } from "@/components/common/segmented";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Settings card: bordered card with a header and divided rows (Pass 5 Settings and Connectors). */
export function SettingsCard({
  id,
  title,
  description,
  action,
  hideHeader,
  children,
  className,
}: {
  id?: string;
  title: string;
  /** Mobile detail screens: the Back header already names the section. */
  hideHeader?: boolean;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const headingId = React.useId();
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-6 overflow-hidden rounded-lg border border-border bg-card", className)}
    >
      <header className={cn("flex items-center gap-3 border-b border-border p-4", hideHeader && "sr-only")}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 id={headingId} className="text-sm font-semibold text-foreground">
            {title}
          </h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function RowText({ label, description, id }: { label: string; description?: string; id?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <p id={id} className="text-sm font-medium text-foreground">
        {label}
      </p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

/** Label + description with a Switch on the right. */
export function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = React.useId();
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <RowText id={id} label={label} description={description} />
      <Switch checked={checked} onCheckedChange={onChange} aria-labelledby={id} />
    </div>
  );
}

/** Label + description with a Toggle Group (AC) on the right. */
export function ChoiceRow<T extends string>({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string;
  description?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    // Mobile detail screens put the segmented control below its label.
    <div className="flex flex-col items-stretch gap-3 px-4 py-3 md:flex-row md:items-center">
      <RowText label={label} description={description} />
      <Segmented value={value} onChange={onChange} options={options} label={label} stretch="mobile" />
    </div>
  );
}

/** Label with a full-width text field underneath. Commits on blur or Enter. */
export function FieldRow({
  label,
  value,
  onCommit,
  placeholder,
}: {
  label: string;
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
}) {
  const id = React.useId();
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);
  return (
    <div className="flex flex-col gap-1.5 p-4">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <SettingsInput
        id={id}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onCommit(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
    </div>
  );
}

/** Label + description with a button on the right. */
export function ActionRow({
  label,
  description,
  action,
}: {
  label: string;
  description?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <RowText label={label} description={description} />
      {action}
    </div>
  );
}

/** Input (Nova): 32px, 10px side padding, radius lg. */
export function SettingsInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input className={cn("h-8 rounded-lg px-2.5 py-1.5 shadow-none", className)} {...props} />;
}

/** Interest tag: secondary pill with a remove (x) button. */
export function InterestTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-secondary py-0.5 pr-1 pl-2 text-xs font-semibold text-secondary-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="flex size-4 items-center justify-center rounded-full outline-none hover:bg-black/10 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  );
}

/** Suggested interest: outline pill with a leading +. */
export function SuggestedTag({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Add ${label} to your interests`}
      className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-semibold text-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Plus className="size-3" aria-hidden />
      {label}
    </button>
  );
}
