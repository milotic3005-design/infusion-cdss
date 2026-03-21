import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/providers/AppProviders';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Infusion CDSS — Clinical Decision Support',
  description: 'Rapid-response clinical decision support for infusion reaction management using NCI CTCAE v6.0 grading.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#f5f5f7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders>
          <OfflineBanner />
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
