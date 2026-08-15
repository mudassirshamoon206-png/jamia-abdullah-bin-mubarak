import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { AuthProvider } from '@/context/AuthContext';
import PublicLayout from '@/components/public/PublicLayout';
import '../globals.css';
 
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  
  // Set direction based on language
  const dir = locale === 'ar' || locale === 'ur' ? 'rtl' : 'ltr';
 
  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <PublicLayout>
              {children}
            </PublicLayout>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
