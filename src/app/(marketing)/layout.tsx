import { MarketingHeader } from '@/components/marketing/header';
import { MarketingFooter } from '@/components/marketing/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#E8F5E9]">
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
