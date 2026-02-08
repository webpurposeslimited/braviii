import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bravilio',
  description: 'Read our privacy policy to understand how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
          Privacy Policy
        </h1>
        <p className="text-neutral-600 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white rounded-2xl p-8 md:p-12 border border-neutral-200">
          <div className="prose prose-neutral max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">1. Introduction</h2>
              <p className="text-neutral-700 mb-4">
                Welcome to Bravilio ("Company", "we", "our", "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we handle your personal data when you visit our website and use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">2. Information We Collect</h2>
              <p className="text-neutral-700 mb-4">We collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                <li>Personal identification information (name, email address, phone number)</li>
                <li>Company information (company name, job title, industry)</li>
                <li>Usage data (how you use our platform, features accessed)</li>
                <li>Technical data (IP address, browser type, device information)</li>
                <li>Lead data that you upload or import into our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">3. How We Use Your Information</h2>
              <p className="text-neutral-700 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                <li>Provide and maintain our services</li>
                <li>Process your transactions and manage your account</li>
                <li>Send you updates, marketing communications, and support messages</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">4. Data Security</h2>
              <p className="text-neutral-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">5. Data Sharing</h2>
              <p className="text-neutral-700 mb-4">
                We do not sell your personal data. We may share your data with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                <li>Service providers who help us operate our platform</li>
                <li>Third-party integrations that you choose to connect</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">6. Your Rights</h2>
              <p className="text-neutral-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Export your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">7. Cookies</h2>
              <p className="text-neutral-700 mb-4">
                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">8. Changes to This Policy</h2>
              <p className="text-neutral-700 mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">9. Contact Us</h2>
              <p className="text-neutral-700 mb-4">
                If you have any questions about this privacy policy, please contact us at:
              </p>
              <p className="text-neutral-700">
                Email: privacy@bravilio.com<br />
                Address: 123 Business Street, San Francisco, CA 94102
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
