import { ReactElement } from "react";
import {
  DashBoard,
  Map,
  ClipBoard,
  PretentionChartLine
} from "@/public/svg";

interface SubMenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface MenuItem {
  isHeader?: boolean;
  title: string;
  icon?: ReactElement;
  href?: string;
  isOpen?: boolean;
  isHide?: boolean;
  child?: SubMenuItem[];
}

interface MenuConfig {
  mainNav: MenuItem[];
  sidebarNav: {
    classic: MenuItem[];
  };
}

export const menusConfig: MenuConfig = {
  mainNav: [
    {
      title: "Home",
      icon: DashBoard,
      child: [
        {
          title: "Map",
          href: "/map",
          icon: Map,
        },
        // {
        //   title: "Map Testing",
        //   href: "/map_testing",
        //   icon: Map,
        // },
      ],
    },
    {
      title: "Reports",
      icon: ClipBoard,
      child: [
        {
          title: "Object Overview",
          href: "/objectoverview",
          icon: PretentionChartLine,
        },
        {
          title: "Trips and Stops",
          href: "/tripsandstops",
          icon: PretentionChartLine,
        },
        {
          title: "Scheduled",
          href: "/scheduled",
          icon: PretentionChartLine,
        },
        {
          title: "Map Route",
          href: "/map-route",
          icon: PretentionChartLine,
        },
        {
          title: "Geocode Processor",
          href: "/geocode-processor",
          icon: PretentionChartLine,
        },
        {
          title: "Valid Raw Message",
          href: "/validrawmessage",
          icon: PretentionChartLine,
        },
        {
          title: "Valid Raw Message (Virtualized)",
          href: "/validrawmessagevirtualized",
          icon: PretentionChartLine,
        },
        {
          title: "Fuel Report",
          href: "/fuel-report",
          icon: PretentionChartLine,
        },
      ],
    },
    {
      title: "Tachograph",
      icon: ClipBoard,
      child: [
        {
          title: "Tachograph Drivers",
          href: "/tachograph?search=drivers",
          icon: PretentionChartLine,
        },
        {
          title: "Tachograph Vehicles",
          href: "/tachograph?search=vehicles",
          icon: PretentionChartLine,
        },
        {
          title: "Tachograph Files",
          href: "/tachograph-files",
          icon: PretentionChartLine,
        },
        {
          title: "Tachograph Live",
          href: "/tachograph-live",
          icon: PretentionChartLine,
        },
      ],
    },
    {
      title: "Administration",
      icon: ClipBoard,
      child: [
        {
          title: "Workers",
          href: "/worker",
          icon: PretentionChartLine,
        },
        {
          title: "Object Group",
          href: "/groups",
          icon: PretentionChartLine,
        },
      ],
    },
  ],
  sidebarNav: {
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Home",
        icon: DashBoard,
        child: [
          {
            title: "Map",
            href: "/map",
            icon: Map,
          },
          // {
          //   title: "Map Testing",
          //   href: "/map_testing",
          //   icon: Map,
          // },
        ],
      },
      {
        title: "Reports",
        icon: ClipBoard,
        child: [
          {
            title: "Object Overview",
            href: "/objectoverview",
            icon: PretentionChartLine,
          },
          {
            title: "Trips and Stops",
            href: "/tripsandstops",
            icon: PretentionChartLine,
          },
          {
            title: "Scheduled",
            href: "/scheduled",
            icon: PretentionChartLine,
          },
          {
            title: "Map Route",
            href: "/map-route",
            icon: PretentionChartLine,
          },
          {
            title: "Geocode Processor",
            href: "/geocode-processor",
            icon: PretentionChartLine,
          },
          {
            title: "Valid Raw Message",
            href: "/validrawmessage",
            icon: PretentionChartLine,
          },
          {
            title: "Valid Raw Message (Virtualized)",
            href: "/validrawmessagevirtualized",
            icon: PretentionChartLine,
          },
          {
            title: "Fuel Report",
            href: "/fuel-report",
            icon: PretentionChartLine,
          },
        ],
      },
      {
        title: "Tachograph",
        icon: ClipBoard,
        child: [
          {
            title: "Tachograph Drivers",
            href: "/tachograph?search=drivers",
            icon: PretentionChartLine,
          },
          {
            title: "Tachograph Vehicles",
            href: "/tachograph?search=vehicles",
            icon: PretentionChartLine,
          },
          {
            title: "Tachograph Files",
            href: "/tachograph-files",
            icon: PretentionChartLine,
          },
          {
            title: "Tachograph Live",
            href: "/tachograph-live",
            icon: PretentionChartLine,
          },
        ],
      },
      {
        title: "Administration",
        icon: ClipBoard,
        child: [
          {
            title: "Workers",
            href: "/worker",
            icon: PretentionChartLine,
          },
          {
            title: "Object Group",
            href: "/groups",
            icon: PretentionChartLine,
          },
        ],
      },
    ],
  },
};

export type { MenuConfig, MenuItem, SubMenuItem }
