import { ArrowRight, CircleCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProviderContext";
import ProductPreview from "@/features/landing/ProductPreview";
import {
  CtaSection,
  FeaturesSection,
  HowItWorksSection,
  LandingFooter,
} from "@/features/landing/LandingSections";
import twinkle from "@/assets/bg_design/twinkle.png";

const highlights = ["No credit card required", "Instant setup", "Cancel anytime"];

function Home() {
  const auth = useAuth();
  const navigate = useNavigate();
  const isSignedIn = auth?.isAuthenticated ?? false;

  const handleStart = () => (isSignedIn ? navigate("/dashboard") : auth?.register());

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-16 pt-14 pb-20 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:pt-24">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium shadow-sm">
              <img src={twinkle} alt="" className="h-4 w-5 object-contain" />
              AI-powered interview practice
            </span>

            <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-tight sm:text-6xl">
              <span className="text-primary">Practice smarter.</span>
              <br />
              <span className="text-(--preparo-teal)">Interview better.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
              Realistic interviews with instant AI feedback, and a roadmap built
              around the job you want. Practice anytime, anywhere.
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button onClick={handleStart} className="h-11 rounded-[6px] px-6 text-sm">
                {isSignedIn ? "Go to dashboard" : "Get started free"}
                <ArrowRight className="size-4" />
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-[6px] px-6 text-sm">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CircleCheck className="size-4 text-(--preparo-teal)" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ProductPreview />
        </section>

        <div className="border-t" />
        <HowItWorksSection />
        <div className="border-t" />
        <FeaturesSection />
        <CtaSection
          onStart={handleStart}
          onLogin={() => auth?.login()}
          isSignedIn={isSignedIn}
        />
      </main>

      <LandingFooter />
    </div>
  );
}

export default Home;
