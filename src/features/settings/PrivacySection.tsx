import { ShieldCheck } from "lucide-react";
import SettingsCard from "./components/SettingsCard";
import type { Settings } from "./api/settingsApi";

function PrivacySection({ legal }: { legal: Settings["legal"] }) {
  const acceptedOn = legal.acceptedAt
    ? new Date(legal.acceptedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <SettingsCard
      id="privacy"
      icon={ShieldCheck}
      title="Privacy & legal"
      description="What you agreed to when you set up Preparo."
    >
      {legal.acceptedTermsVersion || legal.acceptedPrivacyVersion ? (
        <p className="text-sm">
          You accepted the Terms of Service v{legal.acceptedTermsVersion ?? "—"} and Privacy Policy v
          {legal.acceptedPrivacyVersion ?? "—"}
          {acceptedOn && <> on {acceptedOn}</>}.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No terms acceptance on record yet.</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Your answers are processed by AI to generate feedback.
      </p>

      <div className="mt-5 rounded-md border border-dashed p-4">
        <p className="text-sm font-medium">Delete your account</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Self-service deletion isn’t available yet. Contact the Preparo team and we’ll remove your
          account and practice data.
        </p>
      </div>
    </SettingsCard>
  );
}

export default PrivacySection;
