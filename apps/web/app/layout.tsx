import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VedAI - AI Powered Astrology',
  description: 'Your personal AI astrology companion powered by Vedic wisdom',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
