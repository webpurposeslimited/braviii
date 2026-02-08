'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const companyLogos = [
  { name: 'Intercom', initials: 'IC' },
  { name: 'Notion', initials: 'N' },
  { name: 'Ramp', initials: 'R' },
  { name: 'Anthropic', initials: 'A' },
  { name: 'OpenAI', initials: 'OA' },
  { name: 'Vanta', initials: 'V' },
];

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 bg-slate-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-[1.15] tracking-tight mb-6">
              Go to market with{' '}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 italic">unique data</span>
              {' '} and{' '}
              <br className="hidden sm:block" />
              the ability to act on it
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Bravilio is the best way to scale personalized outreach using data 
              from 75+ enrichment tools, AI messaging, and our lead database.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base rounded-full">
                  Start building for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" className="border-neutral-300 bg-white text-black hover:bg-neutral-50 px-8 py-6 text-base rounded-full">
                  Talk to sales
                </Button>
              </Link>
            </div>

            {/* Company Logos */}
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              {companyLogos.map((company) => (
                <div key={company.name} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 bg-white/80 rounded-lg flex items-center justify-center text-xs font-semibold text-neutral-600">
                    {company.initials}
                  </div>
                  <span className="text-sm font-medium text-neutral-600">{company.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative shapes at bottom */}
      <div className="absolute bottom-0 left-0 w-64 h-48 hidden lg:block">
        <div className="absolute bottom-0 left-8 w-12 h-20 bg-blue-200/50 rounded-t-full" />
        <div className="absolute bottom-0 left-16 w-8 h-28 bg-blue-300/50 rounded-t-full" />
        <div className="absolute bottom-0 left-20 w-14 h-16 bg-blue-200/50 rounded-t-full" />
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-48 hidden lg:block">
        <div className="absolute bottom-0 right-8 w-12 h-24 bg-blue-200/50 rounded-t-full" />
        <div className="absolute bottom-0 right-16 w-10 h-32 bg-blue-300/50 rounded-t-full" />
        <div className="absolute bottom-0 right-24 w-14 h-18 bg-blue-200/50 rounded-t-full" />
      </div>
    </section>
  );
}
