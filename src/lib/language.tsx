import React, { createContext, useContext, useState, useEffect } from "react";

export type Lang = "en" | "ar";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("relax_lang") as Lang) || "en";
  });

  useEffect(() => {
    applyLang(lang);
  }, [lang]);

  const setLang = (l: Lang) => {
    localStorage.setItem("relax_lang", l);
    setLangState(l);
    applyLang(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

function applyLang(lang: Lang) {
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
