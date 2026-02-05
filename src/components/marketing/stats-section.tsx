'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Mail, CheckCircle } from 'lucide-react';

const stats = [
  {
    value: '10M+',
    label: 'Leads sourced',
    description: 'From 50+ data sources',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    value: '98.5%',
    label: 'Deliverability rate',
    description: 'Industry-leading accuracy',
    icon: CheckCircle,
    color: 'bg-green-50 text-green-600',
  },
  {
    value: '2.5x',
    label: 'More replies',
    description: 'Compared to cold outreach',
    icon: Mail,
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    value: '15hrs',
    label: 'Saved per week',
    description: 'On average per user',
    icon: TrendingUp,
    color: 'bg-blue-50 text-blue-600',
  },
];

export function StatsSection() {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-40" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 mb-4">
            <span className="text-xs font-medium text-blue-700">BY THE NUMBERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Trusted by <span className="text-blue-600">growing teams</span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Join thousands of companies using Bravilio to scale their outreach.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300">
                <div className={`inline-flex p-3 rounded-xl ${stat.color.split(' ')[0]} mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.split(' ')[1]}`} />
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-black font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-neutral-500">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
