import api from "@/api/axios";
import SideBar from "@/components/shared/SideBar";
import RoadmapSwitcher from "@/components/shared/RoadmapSwitcher";
import { useAuth } from "@/context/AuthProviderContext";

import RoadmapInfoSection from "@/features/roadmap/RoadmapInfoSection";
import RoadmapStage, {
  type UserRoadmapStageProgressResponse,
} from "@/features/roadmap/RoadmapStage";
import RoadmapStageContent from "@/features/roadmap/RoadmapStageContent";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

async function fetchRoadmapStages(publicId: string) {
  const response = await api.get<UserRoadmapStageProgressResponse[]>(
    `/api/roadmap/stages/${publicId}`,
  );
  return response.data;
}

function Roadmap() {
  const auth = useAuth();
  const userName =
    `${auth?.user?.firstName ?? ""} ${auth?.user?.lastName ?? ""}`.trim();
  const publicId = auth?.user?.id;
  const {
    data: stages = [],
    isPending: stagesPending,
    isError: stagesError,
    isFetching: stagesFetching,
    refetch: refetchStages,
  } = useQuery({
    queryKey: ["roadmap-stages", publicId],
    queryFn: () => fetchRoadmapStages(publicId!),
    enabled: Boolean(publicId),
    retry: 1,
    refetchInterval: (query) =>
      query.state.data?.some((stage) => stage.stageStatus === "GENERATING") ? 3000 : false,
  });

  const orderedStages = [...stages].sort(
    (first, second) => first.stageSortOrder - second.stageSortOrder,
  );
  const activeStage =
    orderedStages.find((stage) =>
      ["GENERATING", "FAILED", "AVAILABLE", "IN_PROGRESS", "ACTIVE", "CURRENT", "UNLOCKED"].includes(
        stage.stageStatus?.trim().toUpperCase().replaceAll(" ", "_"),
      ),
    ) ?? orderedStages.find((stage) => !stage.stageCompleted);
  const [selectedStageId, setSelectedStageId] = useState<number>();

  const selectedStage =
    orderedStages.find((stage) => stage.stageId === selectedStageId) ??
    activeStage;


  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <SideBar
        pageName="Roadmap"
        userName={userName || "shadcn"}
        email={auth?.user?.email ?? "m@example.com"}
        avatarUrl="/preparo_sprites/happy-checklist-preparo.png"
        showPlan
      />

      <main className="min-w-0 flex-1 bg-muted/20 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-360">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Learning path</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                Roadmap
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Follow your personalized path and master the skills for your
                dream role.
              </p>
            </div>
            <RoadmapSwitcher />
          </header>

          <RoadmapInfoSection />

          <div className="mt-5 grid gap-5 xl:grid-cols-[380px_1fr]">
            {stagesPending ? (
              <section
                className="animate-pulse rounded-md border bg-card p-5 shadow-sm"
                aria-label="Loading roadmap stages"
              >
                <div className="h-5 w-32 rounded-sm bg-muted" />
                <div className="mt-2 h-3 w-52 rounded-sm bg-muted" />
                <div className="mt-5 space-y-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="h-18 rounded-sm bg-muted" />
                  ))}
                </div>
              </section>
            ) : stagesError ? (
              <section className="rounded-md border border-destructive/20 bg-card p-5 shadow-sm">
                <AlertCircle className="size-5 text-destructive" />
                <h2 className="mt-3 text-sm font-semibold">
                  Couldn’t load roadmap stages
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try loading your stage progress again.
                </p>
                <button
                  type="button"
                  onClick={() => refetchStages()}
                  disabled={stagesFetching}
                  className="mt-4 flex items-center gap-2 rounded-sm border px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
                >
                  <RefreshCw
                    className={`size-3.5 ${stagesFetching ? "animate-spin" : ""}`}
                  />
                  Try again
                </button>
              </section>
            ) : stages.length > 0 ? (
              <RoadmapStage
                stages={stages}
                selectedStageId={selectedStage?.stageId}
                onSelectStage={(stage) => setSelectedStageId(stage.stageId)}
              />
            ) : (
              <section className="rounded-md border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-semibold">
                  No stages available yet
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your roadmap stages will appear here once generated.
                </p>
              </section>
            )}
            <RoadmapStageContent
              stageName={selectedStage?.stageName}
              stageCode={selectedStage?.stageCode}
              stageNumber={selectedStage?.stageSortOrder}
              totalStages={orderedStages.length}
              stageId={selectedStage?.stageId}
              userRoadmapPublicId={selectedStage?.userRoadmapPublicId}
              stageStatus={selectedStage?.stageStatus}
              latestSessionPublicId={selectedStage?.latestSessionPublicId}
              stageCompleted={
                selectedStage?.stageCompleted ||
                selectedStage?.stageStatus?.trim().toUpperCase() === "COMPLETED"
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Roadmap;
