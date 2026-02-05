'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started.',
    price: 49,
    period: 'month',
    features: [
      '1,000 leads/month',
      '500 email verifications',
      '3 email sequences',
      '1 sending account',
      'CSV import/export',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing teams that need more power and flexibility.',
    price: 149,
    period: 'month',
    features: [
      '10,000 leads/month',
      '5,000 email verifications',
      'Unlimited sequences',
      '5 sending accounts',
      'Apollo integration',
      'Google Maps finder',
      'Advanced analytics',
      'AI personalization',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with advanced requirements.',
    price: 399,
    period: 'month',
    features: [
      'Unlimited leads',
      '25,000 email verifications',
      'Unlimited sequences',
      'Unlimited sending accounts',
      'All integrations',
      'Custom fields',
      'Team workspaces',
      'API access',
      'Dedicated support',
      'Custom onboarding',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-cyan/5 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'relative',
                plan.popular && 'md:-mt-4 md:mb-4'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent-cyan text-white text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div
                className={cn(
                  'glass-card p-8 h-full flex flex-col',
                  plan.popular && 'border-accent-cyan/50 shadow-glow'
                )}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-white/60">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-white/60">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup">
                  <Button
                    variant={plan.popular ? 'cyan' : 'glass'}
                    size="lg"
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
