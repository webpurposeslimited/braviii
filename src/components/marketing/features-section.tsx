'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Database,
  Layers,
  Zap,
  GitMerge,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Database,
    title: 'Best GTM data at your fingertips. In one place.',
    description: 'Access 75+ data providers through a single platform. No more juggling multiple subscriptions.',
    color: 'bg-pink-100',
    iconColor: 'text-pink-500',
  },
  {
    icon: Layers,
    title: 'All the best enrichment, combined and automated.',
    description: 'Waterfall enrichment automatically tries multiple sources to maximize coverage.',
    color: 'bg-cyan-100',
    iconColor: 'text-cyan-500',
  },
  {
    icon: Zap,
    title: 'Data enrichment that just works  or you don\'t pay.',
    description: 'Only pay for successful enrichments. No credits wasted on empty results.',
    color: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  {
    icon: GitMerge,
    title: 'Enrich once, output everywhere, all at once.',
    description: 'Push enriched data to your CRM, email tools, and data warehouse automatically.',
    color: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Feature cards */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${feature.color} shrink-0`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right side - Preview card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24"
          >
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
              </div>
              
              {/* Preview content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Search/filter bar */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-neutral-100 rounded-lg" />
                    <div className="h-10 w-24 bg-black rounded-lg" />
                  </div>
                  
                  {/* Data table preview */}
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                      <div className="flex gap-8">
                        <div className="h-4 w-20 bg-neutral-200 rounded" />
                        <div className="h-4 w-24 bg-neutral-200 rounded" />
                        <div className="h-4 w-16 bg-neutral-200 rounded" />
                        <div className="h-4 w-20 bg-neutral-200 rounded" />
                      </div>
                    </div>
                    {[1, 2, 3, 4, 5].map((row) => (
                      <div key={row} className="px-4 py-3 border-b border-neutral-100 last:border-0 flex gap-8 items-center">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full" />
                          <div className="h-4 w-24 bg-neutral-100 rounded" />
                        </div>
                        <div className="h-4 w-32 bg-neutral-100 rounded" />
                        <div className="h-6 w-16 bg-green-100 rounded-full" />
                        <div className="h-4 w-20 bg-neutral-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/signup" className="inline-flex items-center text-sm font-medium text-black hover:text-neutral-600 transition-colors">
                See all features
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
