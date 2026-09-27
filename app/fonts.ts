import { Geist, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

// Shared by app/layout.tsx and .storybook/preview.tsx so both render with
// the same --font-* variables that globals.css tokens point at.

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const newYorkLarge = localFont({
  src: [
    {
      path: "./fonts/NewYorkLarge-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NewYorkLarge-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/NewYorkLarge-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-new-york-large",
  display: "swap",
});

const departureMono = localFont({
  src: [
    {
      path: "./fonts/DepartureMono-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-departure-mono",
  display: "swap",
});

/** Class names that define every --font-* variable. Apply to <html>. */
export const fontVariables = [
  geist.variable,
  jetbrainsMono.variable,
  newYorkLarge.variable,
  departureMono.variable,
].join(" ");
