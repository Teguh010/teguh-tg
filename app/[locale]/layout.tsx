import { siteConfig } from "@/config/site";
import ClientProviders from '@/provider/client-providers';
import i18nConfig from '@/app/i18nConfig';
import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import "flatpickr/dist/themes/light.css";
import "simplebar-react/dist/simplebar.min.css";
import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export const RootLayout: React.FC<RootLayoutProps & { params: { locale: string } }> = ({
  children, params: { locale }
}) => {
  return (
    <html lang={locale}>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

export default RootLayout;
