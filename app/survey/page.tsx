import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Commuter Survey · Savvari",
  description: "Lahore commuter research survey",
};

export default function SurveyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="bg-muted/30 flex-1 px-0">
        <iframe
          title="Savvari commuter survey"
          src="/survey.html"
          className="h-[calc(100vh-3.5rem)] w-full border-0"
        />
      </div>
    </div>
  );
}
