import { useTheme } from "@/context/ThemeProviderContext";
import {
  getDefaultAnswerMode,
  setDefaultAnswerMode,
  type AnswerMode,
} from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { Keyboard, Mic, Monitor, Moon, SlidersHorizontal, Sun, type LucideIcon } from "lucide-react";
import { useState } from "react";
import SettingsCard from "./components/SettingsCard";

type Theme = "light" | "dark" | "system";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border bg-muted/40 p-0.5">
      {options.map((option) => {
        const Icon = option.icon;
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors",
              selected
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const themeOptions: SegmentOption<Theme>[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const answerModeOptions: SegmentOption<AnswerMode>[] = [
  { value: "voice", label: "Voice", icon: Mic },
  { value: "text", label: "Type", icon: Keyboard },
];

function PreferenceRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function PreferencesSection() {
  const { theme, setTheme } = useTheme();
  const [answerMode, setAnswerMode] = useState<AnswerMode>(getDefaultAnswerMode);

  return (
    <SettingsCard
      id="preferences"
      icon={SlidersHorizontal}
      title="Preferences"
      description="Saved on this device and applied right away."
    >
      <div className="grid gap-5">
        <PreferenceRow title="Theme" description="Match your system or pick a look.">
          <SegmentedControl label="Theme" options={themeOptions} value={theme} onChange={setTheme} />
        </PreferenceRow>
        <div className="border-t" />
        <PreferenceRow
          title="Default answer mode"
          description="How each practice interview opens. You can still switch per question."
        >
          <SegmentedControl
            label="Default answer mode"
            options={answerModeOptions}
            value={answerMode}
            onChange={(mode) => {
              setAnswerMode(mode);
              setDefaultAnswerMode(mode);
            }}
          />
        </PreferenceRow>
      </div>
    </SettingsCard>
  );
}

export default PreferencesSection;
