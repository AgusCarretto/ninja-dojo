import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner'
import BottomNav from "@/components/ui/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Code & Dojo | Forja tu camino',
  description: 'Sube de nivel, completa misiones y mantén tu racha ardiente en el dojo.',
  // Reemplaza esto con tu dominio real donde vayas a subir el juego (ej: Vercel o tu dominio)
  metadataBase: new URL('https://agustincarretto.com'),
  openGraph: {
    title: 'Code & Dojo | Forja tu camino',
    description: 'Únete al clan. Sube de nivel, completa tareas y forja tu disciplina diaria.',
    url: '/',
    siteName: 'Code & Dojo',
    images: [
      {
        url: '/og-image.jpg', // Apunta directo a la imagen que pusiste en public/
        width: 1200,
        height: 630,
        alt: 'Code & Dojo Preview',
      },
    ],
    locale: 'es_UY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Code & Dojo | Forja tu camino',
    description: 'Sube de nivel, completa misiones y mantén tu racha ardiente.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <BottomNav />
        <Toaster
          position="bottom-left"  // Abajo a la izquierda
          offset="120px"          // <--- IMPORTANTE: Esto las levanta por encima del menú
          visibleToasts={3}       // Solo muestra 2 a la vez (para no tapar la pantalla)
          richColors              // Colores lindos (Verde/Rojo)
          theme="dark"            // Tema oscuro
          closeButton             // (Opcional) Agrega una X pequeña para cerrar
        />
      </body>
    </html>
  );
}
