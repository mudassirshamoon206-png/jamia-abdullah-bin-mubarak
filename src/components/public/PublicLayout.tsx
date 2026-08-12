"use client";

import { usePathname } from "@/i18n/routing";
import Header from "./Header";
import FloatingContact from "./FloatingContact";
import Footer from "./Footer";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const isPrivate = pathname.startsWith('/admin') || pathname.startsWith('/student') || pathname.startsWith('/login');

  if (isPrivate) {
    return <>{children}</>;
  }

  return (
    <div className="public-layout">
      <Header />
      <div className="public-content">
        {children}
      </div>
      <FloatingContact />
      <Footer />
    </div>
  );
}
