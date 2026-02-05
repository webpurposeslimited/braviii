import { HeroSection } from '@/components/marketing/hero-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { WorkflowsSection } from '@/components/marketing/workflows-section';
import { PlatformsSection } from '@/components/marketing/platforms-section';
import { DataQualitySection } from '@/components/marketing/data-quality-section';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { CTASection } from '@/components/marketing/cta-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <WorkflowsSection />
      <PlatformsSection />
      <DataQualitySection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
