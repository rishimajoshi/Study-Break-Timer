import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Study Break Timer — Focus & Restful Breaks',
  description: 'A calm, supportive study companion helping students develop a manageable rhythm of focused study and restorative breaks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-brand-bg text-brand-navy min-h-screen selection:bg-brand-blue-soft selection:text-brand-blue">
        {children}
      </body>
    </html>
  );
}
