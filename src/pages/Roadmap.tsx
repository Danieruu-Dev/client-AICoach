import api from "@/api/axios";
import SideBar from "@/components/shared/SideBar";
// import RoadmapSwitcher from "@/components/shared/RoadmapSwitcher";
import { Button } from "@/components/ui/button";
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

      <main className="min-w-0 flex-1 bg-muted/20 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8 xl:h-dvh xl:pb-6 xl:pt-6">
        <div className="mx-auto max-w-360 xl:flex xl:h-full xl:flex-col">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Learning path</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight xl:text-2xl">
                Roadmap
              </h1>
              <p className="mt-2 text-sm text-muted-foreground xl:mt-1">
                Follow your personalized path and master the skills for your
                dream role.
              </p>
            </div>
            {/* <RoadmapSwitcher /> */}
          </header>

          <div className="@container mt-5 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
            <div className="grid overflow-hidden rounded-[8px] border bg-card shadow-sm xl:min-h-0 xl:flex-1 @4xl:grid-cols-[18rem_minmax(0,1fr)] @4xl:grid-rows-[minmax(0,1fr)_auto] @6xl:grid-cols-[19rem_minmax(0,1fr)_17rem] @6xl:grid-rows-[minmax(0,1fr)]">
              <div className="flex min-h-0 flex-col border-b @4xl:col-start-1 @4xl:row-start-1 @4xl:border-b-0 @4xl:border-r">
                {stagesPending ? (
                  <div
                    className="animate-pulse p-5"
                    aria-label="Loading roadmap stages"
                  >
                    <div className="h-4 w-32 rounded-sm bg-muted" />
                    <div className="mt-3 h-1.5 rounded-full bg-muted" />
                    <div className="mt-6 space-y-4">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="size-8 shrink-0 rounded-full bg-muted" />
                          <div className="h-8 flex-1 rounded-sm bg-muted" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : stagesError ? (
                  <div className="p-5">
                    <AlertCircle className="size-5 text-destructive" />
                    <h2 className="mt-3 text-sm font-semibold">
                      Couldn’t load roadmap stages
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try loading your stage progress again.
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="mt-4"
                      onClick={() => refetchStages()}
                      disabled={stagesFetching}
                    >
                      <RefreshCw
                        className={stagesFetching ? "animate-spin" : ""}
                      />
                      Try again
                    </Button>
                  </div>
                ) : stages.length > 0 ? (
                  <RoadmapStage
                    stages={stages}
                    selectedStageId={selectedStage?.stageId}
                    onSelectStage={(stage) => setSelectedStageId(stage.stageId)}
                  />
                ) : (
                  <div className="p-5">
                    <h2 className="text-sm font-semibold">
                      No stages available yet
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your roadmap stages will appear here once generated.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex min-h-0 min-w-0 flex-col @4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-1 @6xl:row-span-1">
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
                    selectedStage?.stageStatus?.trim().toUpperCase() ===
                      "COMPLETED"
                  }
                />
              </div>

              <aside className="min-h-0 overflow-y-auto border-t bg-muted/25 @4xl:col-start-1 @4xl:row-start-2 @4xl:border-r @6xl:col-start-3 @6xl:row-start-1 @6xl:border-r-0 @6xl:border-t-0 @6xl:border-l">
                <RoadmapInfoSection />
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Roadmap;
