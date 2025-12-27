import { getTranslations } from 'next-intl/server';
import { MainNavbar } from '@/components/main/MainNavbar';
import { Footer } from '@/components/main/Footer';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNavbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
