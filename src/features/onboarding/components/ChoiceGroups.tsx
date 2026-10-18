import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Choice = {
  id: number | string;
  name: string;
};

type ChoiceGroupProps<T extends Choice> = {
  label: string;
  hint?: string;
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  invalid?: boolean;
  errorMessage?: string;
};

function GroupLabel({
  label,
  hint,
  id,
}: {
  label: string;
  hint?: string;
  id: string;
}) {
  return (
    <div className="mb-3">
      <p id={id} className="text-sm font-medium">
        {label}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function GroupError({ show, message }: { show?: boolean; message?: string }) {
  if (!show || !message) return null;
  return (
    <p role="alert" className="mt-2 text-xs text-destructive">
      {message}
    </p>
  );
}

const toId = (label: string) =>
  `choice-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/**
 * Single-choice cards with an icon and an optional description.
 * Used for short lists (status, role) where seeing every option at once beats a dropdown.
 */
export function ChoiceCards<T extends Choice>({
  label,
  hint,
  options,
  value,
  onChange,
  invalid,
  errorMessage,
  getMeta,
  className,
}: ChoiceGroupProps<T> & {
  getMeta?: (option: T) => { icon?: LucideIcon; description?: string };
  className?: string;
}) {
  const labelId = toId(label);

  return (
    <div>
      <GroupLabel label={label} hint={hint} id={labelId} />
      <div
        role="group"
        aria-labelledby={labelId}
        className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3", className)}
      >
        {options.map((option) => {
          const isSelected = value?.id === option.id;
          const meta = getMeta?.(option);
          const Icon = meta?.icon;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option)}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-[8px] border bg-card px-3 py-2.5 text-left transition-all outline-none hover:border-primary/40 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/40",
                isSelected &&
                  "border-primary bg-primary/4 ring-1 ring-primary hover:border-primary hover:bg-primary/4",
                invalid && !value && "border-destructive/50",
              )}
            >
              {Icon && (
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors",
                    isSelected && "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{option.name}</span>
                {meta?.description && (
                  <span
                    title={meta.description}
                    className="block truncate text-xs text-muted-foreground"
                  >
                    {meta.description}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30",
                )}
              >
                {isSelected && <Check className="size-2.5" strokeWidth={3.5} />}
              </span>
            </button>
          );
        })}
      </div>
      <GroupError show={invalid && !value} message={errorMessage} />
    </div>
  );
}

/** Single-choice pills for compact lists (experience, industry, yes/no). */
export function ChoicePills<T extends Choice>({
  label,
  hint,
  options,
  value,
  onChange,
  invalid,
  errorMessage,
}: ChoiceGroupProps<T>) {
  const labelId = toId(label);

  return (
    <div>
      <GroupLabel label={label} hint={hint} id={labelId} />
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value?.id === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-4 text-sm transition-colors outline-none hover:border-primary/40 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/40",
                isSelected &&
                  "border-primary bg-primary text-primary-foreground hover:border-primary hover:bg-primary/90",
                invalid && !value && "border-destructive/50",
              )}
            >
              {isSelected && <Check className="size-3.5" aria-hidden="true" />}
              {option.name}
            </button>
          );
        })}
      </div>
      <GroupError show={invalid && !value} message={errorMessage} />
    </div>
  );
}
