import React from 'react';
import initTranslations from '@/app/i18n';
import TranslationProvider from '@/app/[locale]/TranslationProvider';
import MainLayout from "./main-layout";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const i18nNamespaces = ['translation'];

const layout: React.FC<LayoutProps> = async ({ children, params: { locale } }: any) => {
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return <TranslationProvider locale={locale} resources={resources} namespaces={i18nNamespaces}>
    <MainLayout>{children}</MainLayout>
  </TranslationProvider>;
};

export default layout;
