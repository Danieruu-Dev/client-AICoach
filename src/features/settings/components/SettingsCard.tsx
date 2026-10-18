import type { LucideIcon } from "lucide-react";

type SettingsCardProps = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
};

function SettingsCard({ id, icon: Icon, title, description, children }: SettingsCardProps) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="overflow-hidden rounded-[8px] border bg-card shadow-sm"
    >
      <header className="flex items-start gap-3 border-b px-5 py-4 sm:px-6">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={`${id}-heading`} className="text-sm font-semibold">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

// Matches the Input component so native <select>/<textarea> fit in
export const fieldControlClass =
  "w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-xs/relaxed dark:bg-input/30";

export default SettingsCard;
