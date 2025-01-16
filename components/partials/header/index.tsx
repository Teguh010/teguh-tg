import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSidebarStore, useThemeStore } from "@/store";
import { useMediaQuery } from "@/hooks/use-media-query";
import ThemeButton from "./theme-button";
import ProfileInfo from "./profile-info";
import HorizontalMenu from "./horizontal-menu";
import Language from "./language";
import MobileMenuHandler from "./mobile-menu-handler";
import ClassicHeader from "./layout/classic-header";
import FullScreen from "./full-screen";
import Refresh from "./refresh";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo/logo_mini_tracegrid.png";

interface NavToolsProps {
  isDesktop: boolean;
  sidebarType: string;
}

const NavTools: React.FC<NavToolsProps> = ({ isDesktop, sidebarType }) => {
  return (
    <div className="nav-tools flex items-center gap-2">
      {<Language />}
      {isDesktop && <Refresh />}
      {isDesktop && <FullScreen />}
      <ThemeButton />
      {/* <Inbox />
      <NotificationMessage /> */}

      <div className="pl-2">
        <ProfileInfo />
      </div>
      {!isDesktop && sidebarType !== "module" && <MobileMenuHandler />}
    </div>
  );
};

interface HeaderProps {
  handleOpenSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleOpenSearch }) => {
  const { sidebarType, setSidebarType } = useSidebarStore();
  const { navbarType } = useThemeStore();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isMobile = useMediaQuery("(min-width: 768px)");

  // set header style to classic if isDesktop
  useEffect(() => {
    if (!isDesktop) {
      setSidebarType("classic");
    }
  }, [isDesktop, setSidebarType]);

  return (
    <ClassicHeader
      className={cn(" ", {
        "sticky top-0 z-50": navbarType === "sticky",
      })}
    >
      {/* <div className="w-full bg-card/90 backdrop-blur-lg lg:px-6 px-[15px] py-3 border-b">
        <div className="flex justify-between items-center h-full">
          <HorizontalHeader handleOpenSearch={handleOpenSearch} />
        </div>
      </div> */}
      {isDesktop ? (
        <div className="bg-card bg-card/90 backdrop-blur-lg w-full px-6 shadow-md  flex justify-between">
          <HorizontalMenu />
          <NavTools
            isDesktop={isDesktop}
            sidebarType={sidebarType}
          />
        </div>
      ) :
        <div className="w-full  bg-card/90 backdrop-blur-lg lg:px-6 px-[15px] py-[6px] border-b">
          <div className="flex justify-between items-center h-full">
            <Link
              href="/map"
              className=" text-primary flex items-center gap-2"
            >
              <Image
                src={logo}
                alt=""
                objectFit="cover"
                className=" mx-auto text-primary h-8 w-8"
              />
            </Link>
            <NavTools isDesktop={isDesktop} sidebarType={sidebarType}/>
          </div>
        </div>
      }
    </ClassicHeader>
  );
};

export default Header;
