import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Provider from "./providers/Provider";

const comicSans = localFont({
  src: "./fonts/Comic-Sans-MS.ttf",
  variable: "--font-comic-sans",
  weight: "100 900",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const frame = {
  version: "next",
  imageUrl: `${baseUrl}/og-image.jpg`,
  button: {
    title: "let's scratching!",
    action: {
      type: "launch_frame",
      name: "scratches 🖌",
      url: baseUrl,
      splashImageUrl: `${baseUrl}/splash.svg`,
      splashBackgroundColor: "#ede4ca",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "scratches 🖌",
    description: "create and mint your own original scratch art that can boggle mind and imagination",
    openGraph: {
      title: "scratches 🖌",
      description: "create and mint your own original scratch art that can boggle mind and imagination",
      url: baseUrl,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 600,
          alt: 'mint your scratch',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "scratches 🖌",
      description: "create and mint your own original scratch art that can boggle mind and imagination",
      images: [`${baseUrl}/og-image.jpg`],
    },
    icons: {
      icon: '/favicon.ico',
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${comicSans.variable} antialiased`}
      >
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
