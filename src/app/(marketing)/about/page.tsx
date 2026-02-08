import { Metadata } from 'next';
import { Target, Users, Zap, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Bravilio',
  description: 'Learn about Bravilio and our mission to help businesses scale their outreach.',
};

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We\'re on a mission to make B2B outreach accessible and effective for businesses of all sizes.',
  },
  {
    icon: Users,
    title: 'Customer-Centric',
    description: 'Our customers are at the heart of everything we do. We build features they need, not just want.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We constantly innovate and improve our platform to stay ahead of the curve.',
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'We take data security seriously and comply with industry standards to protect your data.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Building the future of B2B outreach
          </h1>
          <p className="text-xl text-neutral-600">
            Bravilio was founded with a simple vision: make lead generation and outreach effortless for businesses worldwide.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-12 border border-neutral-200 mb-16">
          <h2 className="text-3xl font-bold text-black mb-6">Our Story</h2>
          <div className="space-y-4 text-neutral-700 text-lg">
            <p>
              Founded in 2024, Bravilio emerged from a simple observation: businesses were struggling with fragmented tools for lead generation, spending countless hours switching between platforms for sourcing, verification, enrichment, and outreach.
            </p>
            <p>
              We set out to build an all-in-one platform that would consolidate these workflows into a single, powerful solution. Today, thousands of businesses use Bravilio to streamline their sales processes and scale their outreach efforts.
            </p>
            <p>
              Our team combines expertise in sales, data engineering, and product development to create tools that actually work. We're constantly listening to our customers and improving our platform based on their feedback.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-neutral-200"
              >
                <div className="inline-flex p-3 rounded-xl bg-blue-100 mb-4">
                  <value.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">{value.title}</h3>
                <p className="text-neutral-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-green-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-xl mb-6 text-white/90">
            We're always looking for talented people to join our mission.
          </p>
          <a
            href="/careers"
            className="inline-block bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            View Open Positions
          </a>
        </div>
      </div>
    </div>
  );
}
