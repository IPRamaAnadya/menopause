import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MemberNavigation from "@/components/member/MemberNavigation";
import { Toaster } from "@/components/ui/toaster";

export default async function MemberLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect(`/${params.locale}/auth/login?callbackUrl=/${params.locale}/member`);
  }

  return (
    <div className="min-h-screen bg-background">
      <MemberNavigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
