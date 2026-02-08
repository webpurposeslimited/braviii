'use client';

import { motion } from 'framer-motion';

const qualityMetrics = [
  {
    value: '98.5%',
    label: 'Email deliverability',
    description: 'Industry-leading verification accuracy',
  },
  {
    value: '95%',
    label: 'Data coverage',
    description: 'Comprehensive contact & company data',
  },
  {
    value: '<2s',
    label: 'Enrichment speed',
    description: 'Real-time data enrichment',
  },
  {
    value: '75+',
    label: 'Data providers',
    description: 'Connected enrichment sources',
  },
];

export function DataQualitySection() {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
            Data quality we&apos;re{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 italic">
              proud of
            </span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            We obsess over data quality so you don&apos;t have to. 
            Every record is verified, enriched, and ready for outreach.
          </p>
        </motion.div>

        {/* Quality metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {qualityMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 hover:border-blue-200 transition-colors shadow-sm">
                <div className="text-4xl sm:text-5xl font-bold text-black mb-2">
                  {metric.value}
                </div>
                <div className="text-base font-medium text-black mb-1">
                  {metric.label}
                </div>
                <div className="text-sm text-neutral-500">
                  {metric.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
