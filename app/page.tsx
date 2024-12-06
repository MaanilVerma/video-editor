import { VideoEditor } from "@/components/VideoEditor";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <main className="container mx-auto">
        <VideoEditor />
      </main>
    </div>
  );
}
