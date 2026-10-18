import { Button } from "@/components/ui/button";
import { KEYCLOAK_ACCOUNT_URL } from "@/api/keycloak";
import { ExternalLink, UserRound } from "lucide-react";
import SettingsCard from "./components/SettingsCard";
import type { Settings } from "./api/settingsApi";

function AccountSection({ account }: { account: Settings["account"] }) {
  const name = `${account.firstName ?? ""} ${account.lastName ?? ""}`.trim() || "—";

  return (
    <SettingsCard
      id="account"
      icon={UserRound}
      title="Account"
      description="Your sign-in details are managed securely by our login provider."
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Name</dt>
          <dd className="mt-1 truncate text-sm font-medium">{name}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Email</dt>
          <dd className="mt-1 truncate text-sm font-medium">{account.email}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-col gap-3 rounded-md bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Change your password, email or name, and sign out of other devices.
        </p>
        <Button asChild variant="outline" className="h-8 shrink-0 px-3">
          <a href={KEYCLOAK_ACCOUNT_URL} target="_blank" rel="noreferrer">
            Manage account
            <ExternalLink />
          </a>
        </Button>
      </div>
    </SettingsCard>
  );
}

export default AccountSection;
