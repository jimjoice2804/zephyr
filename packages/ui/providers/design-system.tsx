import localFont from "next/font/local";
import type { ThemeProviderProps } from "next-themes";
import { Toaster } from "../shadui/toaster";
import ReactQueryProvider from "./query";
import { ThemeProvider } from "./theme";
import { VerificationProvider } from "./verification";

export const SofiaProSoft = localFont({
  src: [
    { path: "../fonts/SofiaProSoftReg.woff2", weight: "400", style: "normal" },
    { path: "../fonts/SofiaProSoftMed.woff2", weight: "500", style: "normal" },
    { path: "../fonts/SofiaProSoftBold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sofia-pro-soft",
  display: "swap",
});

type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => (
  <ReactQueryProvider>
    <ThemeProvider {...properties}>
      <VerificationProvider>{children}</VerificationProvider>
      <Toaster containerClassName="mb-4 mr-4" position="bottom-right" />
    </ThemeProvider>
  </ReactQueryProvider>
);
