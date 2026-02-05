'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles, Send, TrendingUp } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Search,
    title: 'Source Your Leads',
    description: 'Import leads from CSV files, Apollo searches, or discover businesses through Google Maps.',
  },
  {
    step: 2,
    icon: Sparkles,
    title: 'Enrich & Verify',
    description: 'Enrich leads with company data, job titles, and LinkedIn profiles. Verify emails instantly.',
  },
  {
    step: 3,
    icon: Send,
    title: 'Launch Campaigns',
    description: 'Create personalized email sequences with smart scheduling and AI-powered openers.',
  },
  {
    step: 4,
    icon: TrendingUp,
    title: 'Track & Optimize',
    description: 'Monitor opens, clicks, replies, and bounces. Use insights to improve response rates.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-neutral-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <span className="text-xs font-medium text-blue-600">HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Get started in <span className="text-blue-600">minutes</span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Our intuitive platform guides you through every step of building your outreach machine.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent hidden lg:block" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center relative z-10 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-600/30">
                    {step.step}
                  </div>
                  
                  <div className="mt-4 mb-4 flex justify-center">
                    <div className="p-4 rounded-xl bg-blue-50">
                      <step.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Placeholder images for workflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-8 lg:p-12">
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { title: 'Lead Import', desc: 'Drag & drop CSV or connect integrations' },
                { title: 'Data Enrichment', desc: 'Automatic company & contact enrichment' },
                { title: 'Email Sequences', desc: 'Visual sequence builder with templates' },
              ].map((item, index) => (
                <div key={item.title} className="bg-white rounded-xl border border-blue-100 p-6 text-center">
                  <div className="h-32 bg-blue-50 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-4xl font-bold text-blue-200">{index + 1}</div>
                  </div>
                  <h4 className="font-semibold text-black mb-1">{item.title}</h4>
                  <p className="text-sm text-neutral-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
