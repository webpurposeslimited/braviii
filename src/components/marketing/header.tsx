'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'How it Works', href: '#how-it-works' },
  { name: 'Integrations', href: '#integrations' },
  { name: 'Pricing', href: '#pricing' },
];

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#E8F5E9] border-b border-emerald-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-x-12">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">B</span>
              </div>
              <span className="text-xl font-bold text-black">Bravilio</span>
            </Link>

            <div className="hidden lg:flex lg:gap-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-neutral-600 hover:text-black transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-x-3">
            <Link href="/login">
              <Button variant="ghost" className="text-neutral-600 hover:text-black">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-black hover:bg-neutral-800 text-white rounded-full">
                Get Started
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 text-neutral-600 hover:text-black"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="fixed inset-0 bg-black/20"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-neutral-200 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-black">Menu</span>
                <button
                  type="button"
                  className="p-2 text-neutral-500 hover:text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-lg font-medium text-neutral-600 hover:text-black py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full border-neutral-200 text-black">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button className="w-full bg-black hover:bg-neutral-800 text-white rounded-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
