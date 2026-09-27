import type { Metadata } from "next";
import "./globals.css";
import { SubNav } from "./components/SubNav";
import { fontVariables } from "./fonts";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Agentic Design System",
  description: "Design system foundation — tokens, typography, color, spacing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <SubNav />
        <div className={styles.content}>{children}</div>
      </body>
    </html>
  );
}
