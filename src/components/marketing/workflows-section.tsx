'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const workflowFeatures = [
  'Build custom workflows with drag-and-drop',
  'Connect to 50+ tools and data sources',
  'Automate enrichment, scoring, and routing',
  'Set up webhooks and real-time triggers',
];

export function WorkflowsSection() {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
              Turn data into action with flexible,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 italic">
                reliable workflows
              </span>
            </h2>
            
            <p className="text-lg text-neutral-600 mb-8">
              Build powerful automation that connects your data to action. 
              No code required, but fully extensible when you need it.
            </p>

            <ul className="space-y-4 mb-8">
              {workflowFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-neutral-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 rounded-full">
                Start building workflows
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Right side - Workflow preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
              {/* Workflow diagram placeholder */}
              <div className="space-y-4">
                {/* Trigger node */}
                <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <div className="h-4 w-4 bg-purple-500 rounded" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">New lead added</div>
                      <div className="text-xs text-neutral-500">Trigger</div>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                <div className="flex justify-center">
                  <div className="h-8 w-0.5 bg-neutral-300" />
                </div>

                {/* Enrich node */}
                <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <div className="h-4 w-4 bg-blue-500 rounded" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">Enrich with Clearbit</div>
                      <div className="text-xs text-neutral-500">Enrichment</div>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                <div className="flex justify-center">
                  <div className="h-8 w-0.5 bg-neutral-300" />
                </div>

                {/* Verify node */}
                <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <div className="h-4 w-4 bg-green-500 rounded" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">Verify email</div>
                      <div className="text-xs text-neutral-500">Verification</div>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                <div className="flex justify-center">
                  <div className="h-8 w-0.5 bg-neutral-300" />
                </div>

                {/* Output node */}
                <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <div className="h-4 w-4 bg-orange-500 rounded" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">Add to Salesforce</div>
                      <div className="text-xs text-neutral-500">Output</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
