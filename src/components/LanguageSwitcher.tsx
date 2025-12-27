'use client';

import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useLocale } from '@/providers/LocaleProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
  { code: 'zh-HK', label: '繁體中文', shortLabel: '中文', flag: '🇭🇰' },
];

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { locale } = useLocale();
  const pathname = usePathname();
  const currentLanguage = languages.find((lang) => lang.code === locale);

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <span className="text-xl">{currentLanguage?.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((lang) => (
            <DropdownMenuItem key={lang.code} asChild>
              <Link
                href={pathname}
                locale={lang.code as 'en' | 'zh-HK'}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full gap-2">
          <span className="text-lg">{currentLanguage?.flag}</span>
          <span>{currentLanguage?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} asChild>
            <Link
              href={pathname}
              locale={lang.code as 'en' | 'zh-HK'}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
