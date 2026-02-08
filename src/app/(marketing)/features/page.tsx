import { Metadata } from 'next';
import { 
  Users, 
  Mail, 
  CheckCircle, 
  Sparkles, 
  Target,
  BarChart3,
  Zap,
  Globe,
  Shield,
  RefreshCw,
  MessageSquare,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features | Bravilio',
  description: 'Discover all the powerful features of Bravilio for lead sourcing, enrichment, verification, and outreach.',
};

const features = [
  {
    icon: Users,
    title: 'Lead Sourcing',
    description: 'Find your ideal customers with powerful search filters across multiple databases.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    title: 'Data Enrichment',
    description: 'Enrich your leads with accurate company and contact information from multiple sources.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: CheckCircle,
    title: 'Email Verification',
    description: 'Verify email addresses in real-time to reduce bounce rates and improve deliverability.',
    color: 'from-blue-500 to-teal-500',
  },
  {
    icon: Mail,
    title: 'Email Sequences',
    description: 'Create automated email sequences with personalized templates and follow-ups.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Target,
    title: 'Smart Targeting',
    description: 'Use AI-powered targeting to identify your best prospects automatically.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Track campaign performance with detailed analytics and insights.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Zap,
    title: 'Real-time Processing',
    description: 'Process leads and verify emails in real-time with lightning-fast speeds.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Multi-source Integration',
    description: 'Connect with Apollo, Google Maps, LinkedIn, and more data sources.',
    color: 'from-green-500 to-blue-500',
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Enterprise-grade security with SOC 2 compliance and data encryption.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: RefreshCw,
    title: 'Auto-sync',
    description: 'Automatically sync leads with your CRM and keep data up to date.',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'Reply Detection',
    description: 'Automatically detect replies and stop sequences to avoid spam.',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: FileText,
    title: 'Custom Templates',
    description: 'Create and save custom email templates with dynamic variables.',
    color: 'from-amber-500 to-yellow-500',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Everything you need to scale outreach
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Powerful features designed to help you find, verify, and engage with your ideal customers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center bg-white rounded-2xl p-12 border border-neutral-200">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to get started?
          </h2>
          <p className="text-neutral-600 mb-6 max-w-xl mx-auto">
            Join thousands of teams using Bravilio to scale their outreach and grow their business.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" className="border-neutral-300 hover:bg-neutral-50">
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
