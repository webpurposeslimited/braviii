'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const integrations = [
  { name: 'Salesforce', color: 'bg-blue-500' },
  { name: 'HubSpot', color: 'bg-orange-500' },
  { name: 'Apollo', color: 'bg-purple-500' },
  { name: 'Slack', color: 'bg-purple-600' },
  { name: 'Gmail', color: 'bg-red-500' },
  { name: 'Zapier', color: 'bg-orange-400' },
  { name: 'Sheets', color: 'bg-green-500' },
  { name: 'Outlook', color: 'bg-blue-600' },
];

const partners = [
  { name: 'Stripe', letter: 'S' },
  { name: 'Shopify', letter: 'S' },
  { name: 'Notion', letter: 'N' },
  { name: 'Figma', letter: 'F' },
  { name: 'Linear', letter: 'L' },
  { name: 'Vercel', letter: 'V' },
  { name: 'GitHub', letter: 'G' },
  { name: 'Slack', letter: 'S' },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-20 lg:py-32 bg-gradient-to-b from-white to-blue-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
              <span className="text-xs font-medium text-blue-600">INTEGRATIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Connect with your
              <br />
              <span className="text-blue-600">favorite tools</span>
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Bravilio integrates seamlessly with your existing tech stack. 
              Sync data, automate workflows, and keep everything in one place.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                'Bi-directional sync with CRM platforms',
                'Connect email accounts for sending',
                'Export data to spreadsheets automatically',
                'Trigger actions via webhooks and API',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  </div>
                  <span className="text-neutral-700">{item}</span>
                </div>
              ))}
            </div>

            <Link href="/integrations">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                View all integrations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Right side - Integration logos grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Blue glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-3xl blur-2xl" />
            
            <div className="relative bg-white border border-neutral-200 rounded-2xl p-8 shadow-xl shadow-blue-100/50">
              <div className="grid grid-cols-4 gap-4">
                {integrations.map((integration, index) => (
                  <motion.div
                    key={integration.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="aspect-square bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-center hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
                  >
                    <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform`}>
                      {integration.name.charAt(0)}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <p className="text-center text-sm text-neutral-500">
                  And <span className="text-blue-600 font-medium">50+ more</span> integrations
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trusted by logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 pt-16 border-t border-neutral-200"
        >
          <p className="text-center text-sm text-neutral-500 mb-8">TRUSTED BY TEAMS AT</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {partners.map((partner) => (
              <div key={partner.name} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                <div className="h-8 w-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-neutral-400">{partner.letter}</span>
                </div>
                <span className="text-sm font-medium">{partner.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
