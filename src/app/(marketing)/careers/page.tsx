import { Metadata } from 'next';
import { Briefcase, Heart, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers | Bravilio',
  description: 'Join our team and help build the future of B2B outreach.',
};

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance for you and your family.',
  },
  {
    icon: TrendingUp,
    title: 'Growth & Development',
    description: 'Annual learning budget and opportunities for professional growth.',
  },
  {
    icon: Briefcase,
    title: 'Flexible Work',
    description: 'Remote-first culture with flexible hours and unlimited PTO.',
  },
  {
    icon: Users,
    title: 'Great Team',
    description: 'Work with talented, passionate people who care about what they build.',
  },
];

const openings = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Help us build the future of B2B outreach. We're looking for talented people who are passionate about solving real problems.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Why Bravilio?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-neutral-200">
                <div className="inline-flex p-3 rounded-xl bg-blue-100 mb-4">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{benefit.title}</h3>
                <p className="text-neutral-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((opening, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">{opening.title}</h3>
                  <div className="flex gap-4 text-sm text-neutral-600">
                    <span>{opening.department}</span>
                    <span>•</span>
                    <span>{opening.location}</span>
                    <span>•</span>
                    <span>{opening.type}</span>
                  </div>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/contact">Apply Now</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-white rounded-2xl p-12 border border-neutral-200">
          <h2 className="text-2xl font-bold text-black mb-4">
            Don't see the right role?
          </h2>
          <p className="text-neutral-600 mb-6">
            We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <Button asChild variant="outline" className="border-neutral-300 hover:bg-neutral-50">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
