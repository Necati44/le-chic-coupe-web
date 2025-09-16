import type { Metadata } from "next";
import "./globals.css";
import { MeProvider } from "@/components/MeProvider";

export const metadata: Metadata = {
  title: "Le Chic Coupé",
  description: "Salon de coiffure — Réservation en ligne",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <MeProvider>
          {children}
        </MeProvider>
      </body>
    </html>
  );
}