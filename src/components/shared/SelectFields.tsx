import { Label } from "../ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Options = {
  id: number | string;
  name: string;
};

type SelectFieldProps = {
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  value: Options | null;
  onChange: (value: Options | null) => void;
  options: Options[];
  className?: string;
  error?: string;
};

export function SelectField({
  label,
  placeholder,
  icon,
  value,
  onChange,
  options,
  className,
  error,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-[12px] font-semibold text-slate-700">
        {label}
      </Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-sm border cursor-pointer border-slate-200 bg-white px-3 text-left text-[13px] text-slate-600 shadow-sm transition-colors hover:border-slate-300",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
          >
            <span className="flex items-center gap-2 text-slate-700">
              <span className="text-slate-800">{icon}</span>
              <span>{value?.name || placeholder}</span>
            </span>
            <ChevronDown className="size-4 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-(--radix-dropdown-menu-trigger-width)"
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => onChange(option)}
              className="cursor-pointer"
            >
              {option.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
