'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    content: "Bravilio transformed our outreach. We've seen a 3x increase in reply rates since switching from our old tools.",
    author: 'Sarah Chen',
    role: 'VP of Sales',
    company: 'Intercom',
    initials: 'SC',
    gradient: 'from-rose-400 to-pink-500',
  },
  {
    content: "The data quality is incredible. We replaced 4 different tools and our team productivity has never been higher.",
    author: 'Michael Rodriguez',
    role: 'Growth Lead',
    company: 'Ramp',
    initials: 'MR',
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    content: "Finally, an all-in-one solution that actually works. The enrichment quality is consistently impressive.",
    author: 'Emily Watson',
    role: 'Head of RevOps',
    company: 'Notion',
    initials: 'EW',
    gradient: 'from-orange-400 to-amber-500',
  },
];

const companyLogos = [
  { name: 'Intercom', initials: 'IC', color: 'bg-neutral-100' },
  { name: 'Ramp', initials: 'R', color: 'bg-neutral-100' },
  { name: 'Notion', initials: 'N', color: 'bg-neutral-100' },
  { name: 'Figma', initials: 'F', color: 'bg-neutral-100' },
  { name: 'Linear', initials: 'L', color: 'bg-neutral-100' },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#E8F5E9] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
            What our customers{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600 italic">
              say about us
            </span>
          </h2>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl p-6 h-full border border-neutral-200 hover:border-neutral-300 transition-colors">
                <p className="text-neutral-700 mb-6 text-base leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white text-sm font-semibold`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-medium text-black text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-sm text-neutral-500 mb-6">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            {companyLogos.map((company) => (
              <div key={company.name} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div className="h-8 w-8 bg-neutral-200 rounded-lg flex items-center justify-center text-xs font-semibold text-neutral-600">
                  {company.initials}
                </div>
                <span className="text-sm font-medium text-neutral-600">{company.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
