import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  title: 'BlindSpot AI · AI-Powered Decision Reflection & Critical Thinking',
  description: 'Uncover hidden assumptions, overlooked factors, and critical questions before making important decisions.',
  keywords: ['decision reflection', 'critical thinking', 'AI decision analysis', 'blind spots', 'assumption testing'],
  authors: [{ name: 'BlindSpot AI Team' }]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
