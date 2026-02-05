import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Bravilio - Lead Sourcing & Outreach Automation Platform',
  description: 'All-in-one platform for lead sourcing, enrichment, email verification, and outreach automation. Find, enrich, and engage your ideal customers.',
  keywords: ['lead generation', 'email outreach', 'sales automation', 'lead enrichment', 'email verification'],
  authors: [{ name: 'Bravilio' }],
  openGraph: {
    title: 'Bravilio - Lead Sourcing & Outreach Automation Platform',
    description: 'All-in-one platform for lead sourcing, enrichment, email verification, and outreach automation.',
    url: 'https://bravilio.com',
    siteName: 'Bravilio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bravilio - Lead Sourcing & Outreach Automation Platform',
    description: 'All-in-one platform for lead sourcing, enrichment, email verification, and outreach automation.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
