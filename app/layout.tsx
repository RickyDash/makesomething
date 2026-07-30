import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Courier_Prime,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Libre_Franklin,
  Manrope,
  Space_Grotesk,
  Bricolage_Grotesque,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  weight: "900",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "makesomething ☀️",
  description: "build your first app with ai. look what i made!",
  metadataBase: new URL("https://makesomething.so"),
  openGraph: {
    title: "makesomething ☀️",
    description: "look what i made!",
    siteName: "makesomething",
  },
  twitter: {
    card: "summary_large_image",
    title: "makesomething ☀️",
    description: "look what i made!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem("f1-ui-preferences:v1");var value=raw?JSON.parse(raw):null;var root=document.documentElement;root.dataset.uiVersion=value&&value.uiVersion==="v1"?"v1":"v2";root.dataset.v2Mode=value&&value.v2Mode==="notte"?"notte":"giorno"}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${spaceGrotesk.variable} ${bricolageGrotesque.variable} ${instrumentSerif.variable} ${bodoniModa.variable} ${libreFranklin.variable} ${courierPrime.variable} ${ibmPlexMono.variable} min-h-screen text-foreground bg-background font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
