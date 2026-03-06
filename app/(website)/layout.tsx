import '../globals.css';
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
      <body className="min-h-screen" style={{ background: "#F1F5F9", color: "#0F172A", fontFamily: "'Inter',system-ui,sans-serif" }}>
        <Navbar />

        {/* Main Content — NO max-width wrapper here; each page controls its own layout */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer style={{ background: "#0F172A", borderTop: "1px solid #1E293B" }}>
          <div className="max-w-6xl mx-auto px-4 py-8 text-center">
            <p className="text-slate-400 text-sm mb-1">© 2024 Roadside Rescue. All rights reserved.</p>
            <p className="text-slate-500 text-xs">Professional roadside assistance when you need it most.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
