import { ArticlesSection } from '@/components/main/ArticlesSection';
import { FAQSection } from '@/components/main/FAQSection';
import { HeroSection } from '@/components/main/HeroSection';
import { HighlightedArticlesSection } from '@/components/main/HighlightedArticlesSection';
import { ServiceSection } from '@/components/main/ServiceSection';
import { TestimonialSection } from '@/components/main/TestimonialSection';
import { UpcomingEventSection } from '@/components/main/UpcomingEventSection';
import { ValuePropositionSection } from '@/components/main/ValuePropositionSection';



export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ValuePropositionSection />
      <ServiceSection />
      <UpcomingEventSection />
      <FAQSection />
      <TestimonialSection />
      <ArticlesSection />
    </div>
  );
}

