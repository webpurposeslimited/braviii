'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'You get full access to all features for 14 days with no credit card required. At the end of your trial, you can choose a plan that fits your needs or continue with limited free features.',
  },
  {
    question: 'Can I import my existing leads?',
    answer: 'Yes! You can import leads via CSV files with automatic field mapping. We also support direct imports from Apollo and other sources. Our deduplication system ensures you never have duplicate contacts.',
  },
  {
    question: 'How accurate is the email verification?',
    answer: 'Our email verification achieves 99%+ accuracy using multiple validation methods including MX record checks, SMTP verification, and mailbox testing. We identify valid, invalid, risky, and catch-all addresses.',
  },
  {
    question: 'What email providers can I connect?',
    answer: 'We support Gmail and Google Workspace via OAuth, Microsoft 365/Outlook, and any custom SMTP server. Each connected account can send up to 50-200 emails per day depending on your provider limits.',
  },
  {
    question: 'Is there a limit on team members?',
    answer: 'Starter plans include 3 team members, Professional plans include 10, and Enterprise plans have unlimited seats. All team members share the workspace leads and sequences.',
  },
  {
    question: 'How do you handle compliance and unsubscribes?',
    answer: 'Every email includes a compliant unsubscribe link. Unsubscribed contacts are automatically added to your suppression list. We also support CAN-SPAM, GDPR, and other regulatory requirements.',
  },
  {
    question: 'Can I use my own domain for tracking?',
    answer: 'Yes, Professional and Enterprise plans support custom tracking domains. This improves deliverability and makes your tracking links look more professional.',
  },
  {
    question: 'What happens if I exceed my plan limits?',
    answer: "We'll notify you as you approach your limits. You can upgrade anytime or purchase additional credits for overages. We never stop your campaigns mid-send without warning.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 lg:py-32 relative">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg text-white/60">
            Everything you need to know about Bravilio.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card px-6 border-white/10"
              >
                <AccordionTrigger className="text-left text-white hover:text-accent-cyan py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
