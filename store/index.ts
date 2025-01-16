import { create } from "zustand";
import { siteConfig } from "@/config/site";
import type { SiteConfigType } from "@/config/site";

interface ThemeStoreType extends SiteConfigType {
  setTheme: (theme: string) => void;
  setRadius: (value: number) => void;
  setLayout: (value: string) => void;
  setNavbarType: (value: string) => void;
  setFooterType: (value: string) => void;
}

interface SidebarStoreType {
  collapsed: boolean;
  sidebarType: string;
  subMenu: boolean;
  sidebarBg: string;
  mobileMenu: boolean;
  setCollapsed: (value: boolean) => void;
  setSidebarType: (value: string) => void;
  setSubmenu: (value: boolean) => void;
  setSidebarBg: (value: string) => void;
  setMobileMenu: (value: boolean) => void;
}

export const useThemeStore = create<ThemeStoreType>((set) => ({
  theme: siteConfig.theme,
  setTheme: (theme) => set({ theme }),
  radius: siteConfig.radius,
  setRadius: (value) => set({ radius: value }),
  layout: siteConfig.layout,
  setLayout: (value) => {
    set({ layout: value });
    if (value === "horizontal") {
      set({ navbarType: "sticky" });
    }
  },
  navbarType: siteConfig.navbarType,
  setNavbarType: (value) => set({ navbarType: value }),
  footerType: siteConfig.footerType,
  setFooterType: (value) => set({ footerType: value }),
}));

export const useSidebarStore = create<SidebarStoreType>((set) => ({
  collapsed: false,
  setCollapsed: (value) => set({ collapsed: value }),
  sidebarType:
    siteConfig.layout === "semibox" ? "popover" : siteConfig.sidebarType,
  setSidebarType: (value) => set({ sidebarType: value }),
  subMenu: false,
  setSubmenu: (value) => set({ subMenu: value }),
  sidebarBg: siteConfig.sidebarBg,
  setSidebarBg: (value) => set({ sidebarBg: value }),
  mobileMenu: false,
  setMobileMenu: (value) => set({ mobileMenu: value }),
}));

export type { ThemeStoreType, SidebarStoreType }