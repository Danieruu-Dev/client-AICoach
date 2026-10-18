import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProviderContext";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw } from "lucide-react";
import AccountSection from "./AccountSection";
import PreferencesSection from "./PreferencesSection";
import PreparationGoalSection from "./PreparationGoalSection";
import PrivacySection from "./PrivacySection";
import ProfileSection from "./ProfileSection";
import { fetchSettings } from "./api/settingsApi";

function SettingsSkeleton() {
  return (
    <div className="grid gap-5" aria-label="Loading settings">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="animate-pulse rounded-[8px] border bg-card p-6 shadow-sm">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-2 h-3 w-56 rounded bg-muted" />
          <div className="mt-6 h-8 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function SettingsOverview() {
  const auth = useAuth();
  const userId = auth?.user?.id;
  const queryKey = ["settings", userId];
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: fetchSettings,
    enabled: Boolean(userId),
    retry: 1,
  });

  return (
    <section className="min-h-screen flex-1 bg-muted/20 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-3xl">
        <header>
          <p className="text-sm font-medium text-primary">Settings</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight xl:text-2xl">
            Account & preferences
          </h1>
          <p className="mt-2 text-sm text-muted-foreground xl:mt-1">
            Manage your profile, preparation goal and how Preparo works for you.
          </p>
        </header>

        <div className="mt-6">
          {isPending ? (
            <SettingsSkeleton />
          ) : isError ? (
            <div className="flex flex-col gap-4 rounded-[8px] border border-destructive/20 bg-card p-6 shadow-sm sm:flex-row sm:items-center">
              <AlertCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />
              <p className="flex-1 text-sm font-medium">We couldn’t load your settings.</p>
              <Button variant="outline" className="h-9 px-4" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={isFetching ? "animate-spin" : ""} />
                {isFetching ? "Retrying…" : "Try again"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-5">
              <AccountSection account={data.account} />
              {/* key: remount the forms from the saved copy after each save */}
              {data.profile && (
                <ProfileSection key={JSON.stringify(data.profile)} profile={data.profile} queryKey={queryKey} />
              )}
              {data.preparationGoal && (
                <PreparationGoalSection
                  key={JSON.stringify(data.preparationGoal)}
                  goal={data.preparationGoal}
                  queryKey={queryKey}
                />
              )}
              <PreferencesSection />
              <PrivacySection legal={data.legal} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SettingsOverview;
