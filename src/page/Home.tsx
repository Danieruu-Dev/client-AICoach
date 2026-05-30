// import ModeToggle from "@/components/mode-toggle";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, CircleCheck, CirclePlay } from "lucide-react";

function Home() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 pt-20 h-screen sm:px-6 lg:px-8">
        {/* <ModeToggle /> */}

        <section className="mb-3 flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 py-6  overflow-hidden">
          <div className="relative isolate w-full flex-1 text-center lg:text-left">
            <div className="absolute left-1/2 top-12 -z-10 h-28 w-28 -translate-x-1/2 rounded-full bg-teal-400/10 blur-3xl sm:h-36 sm:w-36 lg:hidden" />
            <div className="absolute right-6 top-24 -z-10 hidden h-20 w-20 rounded-full bg-amber-300/15 blur-2xl lg:block" />

            <div className="mx-auto inline-flex max-w-[18rem] flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-[20px] bg-[#FFF2D6] px-2 py-1 text-center text-[13px] font-medium leading-snug text-black sm:max-w-72 lg:mx-0 lg:inline-flex lg:text-[14px]">
              <img
                src="/src/assets/bg_design/twinkle.png"
                alt="Twinkle"
                className="h-5 w-7 shrink-0 object-contain"
              />
              <div className="leading-tight">AI-Powered Interview Practice</div>
            </div>

            <div className="mt-5 flex flex-col gap-2 text-[2.5rem] font-bold leading-[0.92] sm:text-5xl lg:text-[5rem]">
              <div className="text-primary">Practice smarter.</div>
              <div className="text-[#1AAFAD]">Interview better.</div>
            </div>
            <div className="mx-auto mt-5 flex max-w-xl flex-col gap-4 text-[15px] font-medium leading-6 text-muted-foreground sm:text-[16px] lg:mx-0">
              <span>Realistic interviews. Instant AI feedback.</span>
              <span>
                Practice anytime, anywhere. Your path to interview success
                starts here.
              </span>
            </div>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Button className="h-10 rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-none hover:bg-primary/90">
                Get Started Free
                <ArrowRight stroke-width={3} className="ml-1" />
              </Button>

              <Button
                variant="outline"
                className="h-10 rounded-sm border-border bg-background px-4 text-sm font-semibold hover:bg-muted/50"
              >
                View demo
                <CirclePlay stroke-width={2} className="ml-1 size-5.2" />
              </Button>
            </div>

            <div className="mt-8 flex flex-col gap-3 text-[15px] sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <CircleCheck className="text-[#1AAFAD] w-5 h-5" />
                <span className="text-muted-foreground">
                  No credit card required.
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <CircleCheck className="text-[#1AAFAD] w-5 h-5" />
                <span className="text-muted-foreground">Instant setup</span>
              </div>

              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <CircleCheck className="text-[#1AAFAD] w-5 h-5" />
                <span className="text-muted-foreground">Cancel anytime</span>
              </div>
            </div>
          </div>
          <div className=" w-full flex-1 lg:flex flex justify-items-start">
            <div className="relative aspect-square w-full max-w-[20rem] sm:max-w-104 lg:max-w-136">
              <img
                src="/src/assets/bg_design/elipse.png"
                alt=""
                className="absolute inset-x-[50%] top-[8%] z-10 h-auto w-[72%] rotate-[-20deg] object-contain"
              />
              <img
                src="/src/assets/preparo_sprites/happy-checklist-preparo.png"
                alt="Happy Checklist Preparo"
                className="relative z-20 h-full w-full object-contain"
              />
            </div>
          </div>
        </section>
        {/* <footer>Soon</footer> */}
      </main>
    </div>
  );
}

export default Home;
