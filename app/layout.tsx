import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GWEP Field Control",
  description: "Enterprise Security & Facility Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
        {/* Renderiza unicamente a aplicação filha. Sem menu global, para evitar colisão com Sidebars e Single File Apps. */}
        {children}
      </body>
    </html>
  );
}
