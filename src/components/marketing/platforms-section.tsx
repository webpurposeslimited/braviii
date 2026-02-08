'use client';

import { motion } from 'framer-motion';

const platforms = [
  { name: 'Salesforce', color: 'bg-rose-100', textColor: 'text-rose-600' },
  { name: 'HubSpot', color: 'bg-amber-100', textColor: 'text-amber-600' },
  { name: 'Outreach', color: 'bg-lime-100', textColor: 'text-lime-600' },
  { name: 'Apollo', color: 'bg-blue-100', textColor: 'text-blue-600' },
  { name: 'Clearbit', color: 'bg-cyan-100', textColor: 'text-cyan-600' },
  { name: 'ZoomInfo', color: 'bg-teal-100', textColor: 'text-teal-600' },
  { name: 'LinkedIn', color: 'bg-sky-100', textColor: 'text-sky-600' },
  { name: 'Slack', color: 'bg-violet-100', textColor: 'text-violet-600' },
  { name: 'Zapier', color: 'bg-orange-100', textColor: 'text-orange-600' },
  { name: 'Segment', color: 'bg-teal-100', textColor: 'text-teal-600' },
  { name: 'Snowflake', color: 'bg-cyan-50', textColor: 'text-cyan-600' },
  { name: 'BigQuery', color: 'bg-blue-50', textColor: 'text-blue-600' },
];

export function PlatformsSection() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
            Cut costs, access data from{' '}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 italic">
              one central platform
            </span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Replace multiple subscriptions with one powerful platform. 
            Access 75+ data providers through a single integration.
          </p>
        </motion.div>

        {/* Platform logos grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`${platform.color} rounded-full py-3 px-6 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-transparent hover:border-neutral-200`}
              >
                <span className={`text-sm font-semibold ${platform.textColor}`}>
                  {platform.name}
                </span>
              </motion.div>
            ))}
          </div>

          {/* More platforms indicator */}
          <div className="text-center mt-8">
            <span className="text-sm text-neutral-500">
              And 60+ more data providers...
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
