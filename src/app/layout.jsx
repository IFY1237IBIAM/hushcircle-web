import "./globals.css";
import AuthWrapper from "../components/AuthWrapper";
import ContentWarningModal from "../components/ContentWarningModal";
import NetworkBanner from "../components/NetworkBanner";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata = {
  title: "HushCircle — A safe space for your heart",
  description: "Anonymous peer support. Share how you feel without judgment. You are not alone.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          <AuthWrapper>
            <NetworkBanner />
            <ContentWarningModal />
            {children}
          </AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
