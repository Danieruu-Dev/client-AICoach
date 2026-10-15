import api from "@/api/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthProviderContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toProperCase, formatExperience } from "@/utils/textFormatter";

export interface UserRoadmapProfileResponse {
  userPublicId: string;
  preparationGoalPublicId: string;
  codingExperienceLevel: string;
  role: string;
  currentStatus: string;
  targetIndustry: string;
  preparationGoalTech: string;
}

function getTechnologyNames(value: string): string[] {
  if (!value?.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((technology) => {
          if (typeof technology === "string") return technology;
          if (
            typeof technology === "object" &&
            technology !== null &&
            "name" in technology &&
            typeof technology.name === "string"
          ) {
            return technology.name;
          }
          return "";
        })
        .map((name) => name.trim())
        .filter(Boolean);
    }
  } catch {
    // The API may return a plain comma-separated list rather than JSON.
  }

  return value
    .split(",")
    .map((technology) => technology.trim())
    .filter(Boolean);
}

async function fetchRoadmapProfile(publicId: string) {
  const response = await api.get<
    UserRoadmapProfileResponse | UserRoadmapProfileResponse[]
  >(`/api/roadmap/profile/${publicId}`);
  return Array.isArray(response.data) ? response.data[0] : response.data;
}

function RoadmapInfoSection() {
  const auth = useAuth();
  const publicId = auth?.user?.id;
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["roadmap-profile", publicId],
    queryFn: () => fetchRoadmapProfile(publicId!),
    enabled: Boolean(publicId),
    retry: 1,
  });

  const heading = (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      Target profile
    </p>
  );

  if (isPending) {
    return (
      <div className="animate-pulse p-5" aria-label="Loading roadmap profile">
        <div className="h-3 w-24 rounded-sm bg-muted" />
        <div className="mt-4 h-5 w-40 rounded-sm bg-muted" />
        <div className="mt-3 h-5 w-32 rounded-sm bg-muted" />
        <div className="mt-6 h-16 rounded-sm bg-muted" />
      </div>
    );
  }

  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  if (isError && !notFound) {
    return (
      <div className="p-5">
        {heading}
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          Couldn’t load roadmap information. Check your connection and try
          again.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="mt-3"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={isFetching ? "animate-spin" : ""} />
          Try again
        </Button>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="p-5">
        {heading}
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          No roadmap profile yet. Complete your preparation goal to generate
          this information.
        </p>
      </div>
    );
  }

  const technologies = getTechnologyNames(data.preparationGoalTech);
  const facts = [
    {
      label: "Experience",
      value: formatExperience(data.codingExperienceLevel || "Not specified"),
    },
    {
      label: "Status",
      value: toProperCase(data.currentStatus || "Not specified"),
    },
    { label: "Industry", value: data.targetIndustry || "Not specified" },
  ];

  return (
    <div className="p-5">
      {heading}
      <h3 className="mt-3 text-base font-semibold tracking-tight">
        {data.role || "Target role"}
      </h3>
      <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
        Primary hard coded
      </Badge>
      {technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {technologies.map((item) => (
            <Badge key={item} variant="outline" className="bg-card">
              {item}
            </Badge>
          ))}
        </div>
      )}
      <Separator className="my-4" />
      <dl className="space-y-3 text-xs">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex items-baseline justify-between gap-4"
          >
            <dt className="text-muted-foreground">{fact.label}</dt>
            <dd className="text-right font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default RoadmapInfoSection;
