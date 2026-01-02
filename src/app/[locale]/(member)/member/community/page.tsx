import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ComingSoonContent } from "@/components/lounge/ComingSoonContent";

interface CommunityPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const session = await getServerSession(authOptions);
  const { locale } = await params;

  if (!session?.user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/member/community`);
  }

  return <ComingSoonContent />;
}
