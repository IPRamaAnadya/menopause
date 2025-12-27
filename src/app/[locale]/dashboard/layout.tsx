import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  
  // Double-check authorization on the server side
  if (!session) {
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/dashboard`);
  }
  
  if (session.user?.role !== 'Administrator') {
    redirect(`/${locale}?error=unauthorized`);
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
