"use client";

import { useEffect, useState } from "react";

// Lightweight i18n helper. Not a full framework — just a typed string table
// and a useLanguage() hook backed by localStorage. Add new keys to BOTH locales
// (TypeScript will enforce parity via the shared `Dict` type).
//
// Trigger: Indian SME users in tier-2/3 cities asked for Hindi support. Keep
// this synchronous + dependency-free so it can run on first paint without a
// flash of English content.

export type Lang = "en" | "hi";

export const DEFAULT_LANG: Lang = "en";
const STORAGE_KEY = "erpbuilder:lang";

const dict = {
  en: {
    "common.dashboard": "Dashboard",
    "common.marketplace": "Marketplace",
    "common.managePages": "Manage Pages",
    "common.manageTables": "Manage Tables",
    "common.plugins": "Plugins",
    "common.builder": "Builder",
    "common.helpDocs": "Help & docs",
    "common.logout": "Logout",
    "common.openMyErp": "Open my ERP",
    "common.search": "Search records, modules, pages...",
    "common.notifications": "Notifications",
    "common.allCaughtUp": "All caught up",
    "common.noNotifications": "No new notifications",
    "common.notificationHint": "System alerts and activity will show up here.",
    "common.settings": "Settings",
    "common.language": "Language",
    "common.english": "English",
    "common.hindi": "हिन्दी",
  },
  hi: {
    "common.dashboard": "डैशबोर्ड",
    "common.marketplace": "मार्केटप्लेस",
    "common.managePages": "पेज प्रबंधन",
    "common.manageTables": "टेबल प्रबंधन",
    "common.plugins": "प्लगइन्स",
    "common.builder": "बिल्डर",
    "common.helpDocs": "सहायता",
    "common.logout": "लॉग आउट",
    "common.openMyErp": "मेरा ERP खोलें",
    "common.search": "रिकॉर्ड, मॉड्यूल, पेज खोजें...",
    "common.notifications": "सूचनाएं",
    "common.allCaughtUp": "सब अपडेट है",
    "common.noNotifications": "कोई नई सूचना नहीं",
    "common.notificationHint": "सिस्टम अलर्ट और गतिविधियाँ यहाँ दिखेंगी।",
    "common.settings": "सेटिंग्स",
    "common.language": "भाषा",
    "common.english": "English",
    "common.hindi": "हिन्दी",
  },
} as const;

export type TranslationKey = keyof (typeof dict)["en"];
type Dict = Record<TranslationKey, string>;

// Compile-time guarantee that hi has every key that en does. If TypeScript
// stops flagging missing keys, this assertion is the place that broke.
const _hiCheck: Dict = dict.hi;
void _hiCheck;

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "hi" ? "hi" : "en";
}

export function setStoredLang(lang: Lang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, lang);
  // Broadcast so other components on the same tab re-read without a remount.
  window.dispatchEvent(new CustomEvent("erpbuilder:lang-change", { detail: lang }));
}

export function useLanguage(): {
  lang: Lang;
  setLang: (next: Lang) => void;
  t: (key: TranslationKey) => string;
} {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    setLangState(getStoredLang());
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<Lang>;
      if (ce.detail === "hi" || ce.detail === "en") {
        setLangState(ce.detail);
      }
    };
    window.addEventListener("erpbuilder:lang-change", onChange);
    return () => window.removeEventListener("erpbuilder:lang-change", onChange);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    setStoredLang(next);
  };

  const t = (key: TranslationKey): string => {
    return (dict[lang] as Dict)[key] ?? (dict.en as Dict)[key] ?? key;
  };

  return { lang, setLang, t };
}
