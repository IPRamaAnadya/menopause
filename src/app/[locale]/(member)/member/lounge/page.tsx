import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HeroLounge } from "@/components/lounge/HeroLounge";
import { LoungeArticles } from "@/components/lounge/LoungeArticles";
import { LoungeEvents } from "@/components/lounge/LoungeEvents";

export default async function LoungePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroLounge userName={session?.user?.name || "Member"} />

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Articles Section */}
        <LoungeArticles />

        {/* Events Section */}
        <LoungeEvents />

        {/* Additional sections can be added here */}
      </div>
    </div>
  );
}
