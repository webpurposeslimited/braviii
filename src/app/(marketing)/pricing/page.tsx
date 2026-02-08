import { Metadata } from 'next';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing | Bravilio',
  description: 'Simple, transparent pricing for teams of all sizes.',
};

const plans = [
  {
    name: 'Starter',
    price: 49,
    description: 'Perfect for individuals and small teams getting started',
    features: [
      '1,000 leads per month',
      '500 email verifications',
      '2 email sequences',
      'Basic analytics',
      'Email support',
      '1 sending account',
    ],
  },
  {
    name: 'Professional',
    price: 149,
    description: 'For growing teams that need more power',
    popular: true,
    features: [
      '10,000 leads per month',
      '5,000 email verifications',
      'Unlimited sequences',
      'Advanced analytics',
      'Priority support',
      '5 sending accounts',
      'CRM integrations',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    price: 499,
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited leads',
      'Unlimited verifications',
      'Unlimited sequences',
      'Custom analytics',
      'Dedicated support',
      'Unlimited sending accounts',
      'Advanced integrations',
      'Custom API limits',
      'SSO & SAML',
      'Custom onboarding',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Choose the plan that's right for your team. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 border-2 ${
                plan.popular ? 'border-blue-500' : 'border-neutral-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
              <p className="text-neutral-600 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-black">${plan.price}</span>
                <span className="text-neutral-600">/month</span>
              </div>
              <Button
                asChild
                className={`w-full mb-6 ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white border-2 border-neutral-300 hover:bg-neutral-50 text-black'
                }`}
              >
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center bg-white rounded-2xl p-12 border border-neutral-200">
          <h2 className="text-2xl font-bold text-black mb-4">
            Need a custom plan?
          </h2>
          <p className="text-neutral-600 mb-6">
            Contact our sales team for custom pricing and features tailored to your needs.
          </p>
          <Button asChild variant="outline" className="border-neutral-300 hover:bg-neutral-50">
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
