import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function NotAvailable() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4 text-center items-center">
          <div className="flex size-36 items-center justify-center p-4 sm:size-100 mx-auto">
            <img
              src="/src/assets/preparo_sprites/builder-preparo.png"
              alt="Builder Preparo"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-3xl font-semibold sm:text-4xl">
              Still building this page
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            This section is not ready yet. We are putting the final pieces
            together so it can become a polished experience.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-5">
              <Link to="/dashboard">
                <ArrowLeft className="mr-2 size-4" />
                Go back to dashboard
              </Link>
            </Button>

            <Button variant="outline" className="rounded-full px-5" asChild>
              <Link to="/">
                <Sparkles className="mr-2 size-4" />
                Visit home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotAvailable;
