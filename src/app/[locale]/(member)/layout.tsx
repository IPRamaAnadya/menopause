import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";
import LoungeNavigation from "@/components/lounge/LoungeNavigation";
import BottomNavbar from "@/components/lounge/BottomNavbar";
import { MemberFooter } from "@/components/lounge/MemberFooter";

export default async function LoungeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { locale } = await params;

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/lounge`);
  }

  // Optional: Check if user has active membership
  // You can add membership level checks here if needed

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <LoungeNavigation />
      <main className="w-full">
        {children}
      </main>
      <MemberFooter />
      <BottomNavbar />
      <Toaster />
    </div>
  );
}
