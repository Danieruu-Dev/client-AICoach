import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { codingExperienceOptions, currentStatusOptions } from "@/features/onboarding/profileOptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IdCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SettingsCard, { fieldControlClass } from "./components/SettingsCard";
import {
  settingsErrorMessage,
  updateProfile,
  type SettingsProfile,
  type UpdateProfileRequest,
} from "./api/settingsApi";

const BIO_MAX = 500;

function toForm(profile: SettingsProfile): UpdateProfileRequest {
  return {
    displayName: profile.displayName ?? "",
    bio: profile.bio ?? "",
    currentStatus: profile.currentStatus ?? "",
    codingExperience: profile.codingExperience ?? "",
  };
}

// Remounted (via key) whenever saved data changes, so the form always starts from the server copy
function ProfileSection({ profile, queryKey }: { profile: SettingsProfile; queryKey: unknown[] }) {
  const queryClient = useQueryClient();
  const initial = toForm(profile);
  const [form, setForm] = useState(initial);

  const isDirty = (Object.keys(initial) as (keyof UpdateProfileRequest)[]).some(
    (field) => form[field] !== initial[field],
  );
  const isComplete = Boolean(form.currentStatus && form.codingExperience);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKey, settings);
      toast.success("Profile saved");
    },
    onError: (error) => toast.error(settingsErrorMessage(error, "Couldn’t save your profile")),
  });

  const update = (field: keyof UpdateProfileRequest) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <SettingsCard
      id="profile"
      icon={IdCard}
      title="Profile"
      description="How you appear in Preparo and where you are in your journey."
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (isDirty && isComplete) mutation.mutate(form);
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            className="h-8"
            maxLength={100}
            placeholder="What should we call you?"
            value={form.displayName}
            onChange={update("displayName")}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            rows={3}
            maxLength={BIO_MAX}
            className={`${fieldControlClass} resize-y`}
            placeholder="A line or two about you and what you’re preparing for"
            value={form.bio}
            onChange={update("bio")}
          />
          <p className="text-right text-[11px] text-muted-foreground">
            {form.bio.length}/{BIO_MAX}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="currentStatus">Current status</Label>
            <select
              id="currentStatus"
              className={`${fieldControlClass} h-8`}
              value={form.currentStatus}
              onChange={update("currentStatus")}
            >
              <option value="" disabled>
                Select your status
              </option>
              {currentStatusOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="codingExperience">Coding experience</Label>
            <select
              id="codingExperience"
              className={`${fieldControlClass} h-8`}
              value={form.codingExperience}
              onChange={update("codingExperience")}
            >
              <option value="" disabled>
                Select your experience
              </option>
              {codingExperienceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Changing your status or experience won’t regenerate your current roadmap.
        </p>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-3"
            disabled={!isDirty || mutation.isPending}
            onClick={() => setForm(initial)}
          >
            Discard
          </Button>
          <Button
            type="submit"
            className="h-8 px-4"
            disabled={!isDirty || !isComplete || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {mutation.isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

export default ProfileSection;
