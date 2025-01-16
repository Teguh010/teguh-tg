"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from "react-i18next";
import flag1 from "@/public/images/all-img/flag-1.png";
import flag2 from "@/public/images/all-img/flag-4.png";
import flag3 from "@/public/images/all-img/flag_francia.webp";
import flag4 from "@/public/images/all-img/images_lt.png";
import flag5 from "@/public/images/all-img/Flag_Portugal.svg.png";
import flag6 from "@/public/images/all-img/Flag_Russia.png";
import flag7 from "@/public/images/all-img/flag_noruega.png";
import i18nConfig from '@/app/i18nConfig';
import { useUser } from "@/context/UserContext";

const data = [
  {
    name: "En",
    slug: "en",
    flag: flag1
  },
  {
    name: "Es",
    slug: "es",
    flag: flag2
  },
  {
    name: "Fr",
    slug: "fr",
    flag: flag3
  },
  {
    name: "Lt",
    slug: "lt",
    flag: flag4
  },
  {
    name: "Pt",
    slug: "pt",
    flag: flag5
  },
  {
    name: "Ru",
    slug: "ru",
    flag: flag6
  },
  {
    name: "No",
    slug: "no",
    flag: flag7
  },
]

const Language = () => {
  const [selected, setSelected] = useState(data[0]);
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();
  const UserContext = useUser();
  const { settings } = UserContext.models;
  const { setSettings } = UserContext.operations;

  const handleLanguageChange = useCallback((item: any) => () => {
    const updatedSettings = [...settings];
    const newLocale = item.slug;
    const isDefaultLocale = currentLocale === i18nConfig.defaultLocale;
    const languageSettingIndex = settings.findIndex(setting => setting.title === "language");

    if (languageSettingIndex !== -1) {
      updatedSettings[languageSettingIndex] = {
        ...updatedSettings[languageSettingIndex],
        value: newLocale
      };
    } else {
      updatedSettings.unshift({ title: "language", value: newLocale });
    }

    setSettings(updatedSettings);
    const newPathname = isDefaultLocale
      ? `/${newLocale}${currentPathname}`
      : currentPathname.replace(`/${currentLocale}`, `/${newLocale}`);

    router.push(newPathname);
    router.refresh();
  }, [currentLocale, currentPathname, router, settings, i18nConfig.defaultLocale]);

  useEffect(() => {
    if (settings.length > 0) {
      data.map((item) => {
        if (item.slug === settings.find((setting: { title: string; }) => setting.title === "language").value) {
          setSelected(item);
        }
      });
    }
  }, [settings]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button" className="bg-transparent hover:bg-transparent">
          <span className="w-6 h-6 rounded-full mr-1.5">
            <Image
              src={selected ? selected.flag : flag1}
              alt=""
              className="w-full h-full object-cover rounded-full" />
          </span>
          <span className="text-sm text-default-600">{selected ? selected.name : "En"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2">
        {
          data.map((item, index) => (
            <DropdownMenuItem
              key={`flag-${index}`}
              className={cn("py-1.5 px-2 cursor-pointer dark:hover:bg-background mb-[2px] last:mb-0", {
                "bg-primary-100 ": selected && selected.name === item.name
              })}
              onClick={handleLanguageChange(item)}
            >
              <span className="w-6 h-6 rounded-full mr-1.5">
                <Image src={item.flag} alt="" className="w-full h-full object-cover rounded-full" />
              </span>
              <span className="text-sm text-default-600">{item.name}</span>
              {
                selected && selected.name === item.name &&
                <Check className="w-4 h-4 flex-none ml-auto text-default-700" />
              }

            </DropdownMenuItem>
          ))
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Language;