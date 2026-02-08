import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Bravilio',
  description: 'Read our terms of service to understand the rules and regulations for using Bravilio.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
          Terms of Service
        </h1>
        <p className="text-neutral-600 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white rounded-2xl p-8 md:p-12 border border-neutral-200">
          <div className="prose prose-neutral max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">1. Acceptance of Terms</h2>
              <p className="text-neutral-700 mb-4">
                By accessing and using Bravilio's services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">2. Use of Services</h2>
              <p className="text-neutral-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                <li>Use our services only for lawful purposes</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use our services for spam or unsolicited communications</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>Not use our services to transmit malicious code or malware</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">3. Account Registration</h2>
              <p className="text-neutral-700 mb-4">
                To use certain features of our services, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">4. Subscription and Billing</h2>
              <p className="text-neutral-700 mb-4">
                Our services are available on a subscription basis. You agree to pay all fees associated with your chosen plan. Subscriptions automatically renew unless cancelled before the renewal date. We reserve the right to change our pricing with 30 days notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">5. Data and Content</h2>
              <p className="text-neutral-700 mb-4">
                You retain ownership of all data and content you upload to our platform. By using our services, you grant us a license to use, store, and process this data to provide our services. You are responsible for ensuring you have the right to use and process any data you upload.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">6. Prohibited Activities</h2>
              <p className="text-neutral-700 mb-4">You may not:</p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                <li>Resell or redistribute our services</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use our services to violate any laws or regulations</li>
                <li>Scrape or harvest data from our platform</li>
                <li>Interfere with or disrupt our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">7. Intellectual Property</h2>
              <p className="text-neutral-700 mb-4">
                All intellectual property rights in our services, including software, designs, and trademarks, belong to Bravilio. You may not use our intellectual property without our prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">8. Limitation of Liability</h2>
              <p className="text-neutral-700 mb-4">
                To the maximum extent permitted by law, Bravilio shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">9. Termination</h2>
              <p className="text-neutral-700 mb-4">
                We reserve the right to suspend or terminate your account if you violate these terms or engage in conduct that we deem harmful to our services or other users. You may cancel your account at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">10. Changes to Terms</h2>
              <p className="text-neutral-700 mb-4">
                We may modify these terms at any time. We will notify you of significant changes via email or through our platform. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">11. Contact</h2>
              <p className="text-neutral-700 mb-4">
                For questions about these terms, contact us at:
              </p>
              <p className="text-neutral-700">
                Email: legal@bravilio.com<br />
                Address: 123 Business Street, San Francisco, CA 94102
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
