"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const PRIMARY_ITEMS = [
  { label: "Explore", href: "/dashboard", iconSrc: "/icons/search.svg" },
  {
    label: "Create Strategies",
    href: "/dashboard/create",
    iconSrc: "/icons/plus.svg",
  },
  {
    label: "My Strategies",
    href: "/dashboard/my-strategies",
    iconSrc: "/icons/my-strategy.svg",
  },
];

const SECONDARY_ITEMS = [
  { label: "Learn", href: "/dashboard/learn", iconSrc: "/icons/learn.svg" },
  { label: "Market", href: "/dashboard/market", iconSrc: "/icons/market.svg" },
];

const TERTIARY_ITEMS = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    iconSrc: "/icons/settings.svg",
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    iconSrc: "/icons/notifications.svg",
  },
];

const baseLinkClasses =
  "relative flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-[var(--app-text)]/90 transition-all duration-150 ease-out hover:text-[var(--app-text)]";
const activeLinkClasses =
  "text-[#1FE9F7] bg-transparent border border-[#1FE9F7]/40 shadow-[0_0_20px_rgba(31,233,247,0.3)]";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();

  const renderLink = (item: {
    label: string;
    href: string;
    iconSrc: string;
  }) => {
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => onClose?.()}
        className={clsx(
          baseLinkClasses,
          isActive && activeLinkClasses,
          "group"
        )}
      >
        <Image
          src={item.iconSrc}
          alt={item.label}
          width={20}
          height={20}
          className={clsx(
            "h-5 w-5 transition-opacity",
            isActive ? "opacity-100 brightness-150" : "opacity-70"
          )}
          priority={isActive}
        />
        <span className="relative">
          {item.label}
          {/* {isActive && (
            <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#1FE9F7] rounded-full" />
          )} */}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--app-overlay)] backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:sticky top-0 z-50 flex h-screen w-[232px] shrink-0 flex-col overflow-y-auto bg-[var(--app-bg)] border-r border-[#1a1a1a] px-6 py-6 sm:py-8 transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 text-[var(--app-text)]"
            : "-translate-x-full lg:translate-x-0 text-[var(--app-text)]"
        )}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <Image
            src="/nirLogoWhite.png"
            alt="logo"
            width={46}
            height={46}
            className="w-8 h-8 sm:w-[46px] sm:h-[46px] cursor-pointer"
          />

          <button
            onClick={onClose}
            className="flex items-center justify-end text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-2 mb-8 text-nowrap">
          {PRIMARY_ITEMS.map(renderLink)}
        </nav>

        {/* Separator */}
        <div className="h-px bg-[var(--app-text)]/10 my-2" />

        {/* Secondary Navigation */}
        <nav className="flex flex-col gap-2 my-8">
          {SECONDARY_ITEMS.map(renderLink)}
        </nav>

        {/* Separator */}
        <div className="h-px bg-[var(--app-text)]/10 my-2" />

        {/* Tertiary Navigation */}
        <nav className="flex flex-col gap-2 mt-8">
          {TERTIARY_ITEMS.map(renderLink)}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
