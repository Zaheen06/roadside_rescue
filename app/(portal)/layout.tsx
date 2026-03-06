import '../globals.css';
import "leaflet/dist/leaflet.css";
import { ReactNode } from 'react';

export const metadata = {
    title: 'Roadside Rescue - Portal',
    description: 'Technician and Admin Portal for Roadside Rescue.'
};

export default function PortalLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen font-sans bg-slate-900 text-slate-100">
                <main className="min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}
