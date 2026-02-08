'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-blue-50 to-slate-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-100/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-64 h-64">
        <div className="absolute bottom-0 left-8 w-16 h-24 bg-blue-200/60 rounded-t-full" />
        <div className="absolute bottom-0 left-20 w-12 h-32 bg-blue-300/60 rounded-t-full" />
        <div className="absolute bottom-0 left-28 w-20 h-20 bg-blue-200/60 rounded-t-full" />
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64">
        <div className="absolute bottom-0 right-8 w-16 h-28 bg-blue-200/60 rounded-t-full" />
        <div className="absolute bottom-0 right-20 w-14 h-36 bg-blue-300/60 rounded-t-full" />
        <div className="absolute bottom-0 right-32 w-18 h-22 bg-blue-200/60 rounded-t-full" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
            Turn your growth ideas{' '}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500">
              into reality today
            </span>
          </h2>
          <p className="text-lg text-neutral-600 mb-10 max-w-xl mx-auto">
            Join thousands of sales teams using Bravilio to find and engage their ideal customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          <p className="mt-6 text-sm text-neutral-500">
            No credit card required • 14-day free trial
          </p>
        </motion.div>
      </div>
    </section>
  );
}
