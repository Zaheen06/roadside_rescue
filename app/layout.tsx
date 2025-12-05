// app/layout.tsx
import './globals.css';
import "leaflet/dist/leaflet.css";
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Roadside Rescue - 24/7 Emergency Assistance',
  description: 'Professional on-demand tyre, fuel & breakdown roadside assistance. Available 24/7 across the city.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <Navbar />

        {/* Main Content */}
        <main className="min-h-screen py-8">
          <div className="max-w-6xl mx-auto px-4">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="glass mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center text-gray-600">
              <p className="mb-2">© 2024 Roadside Rescue. All rights reserved.</p>
              <p className="text-sm">Professional roadside assistance when you need it most.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
