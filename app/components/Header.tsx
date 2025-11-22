"use client";

import Image from "next/image";
import Link from "next/link";
import { Input } from "./ui/input";
import { SearchIcon, Menu } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import nir_logo from "@/public/nirLogoWhite.png";
import ConnectWallet from "./ConnectWallet";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 bg-[var(--app-bg)] text-[var(--app-text)] gap-2 sm:gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[var(--app-text-muted)] hover:text-[var(--app-text)] p-2 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none cursor-pointer"
        >
          <Menu size={24} />
        </button>
        <Link
          href="/"
          className="cursor-pointer shrink-0 outline-none border-none focus:outline-none focus:ring-0 focus:border-none"
        >
          <Image
            src={nir_logo}
            alt="logo"
            width={70}
            height={56}
            className="w-8 h-8 sm:w-[76px] sm:h-[50px]"
          />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-2xl">
        <div className="flex items-center gap-2 w-full bg-[#EDFCFE0F] rounded-full px-5 py-2 relative">
          <Input
            placeholder="Search by name, Curator, or strategy type..."
            className="w-full max-w-[514px] placeholder:text-[var(--app-text-muted)] text-[var(--app-text)] ml-4.5 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
          />
          <Button className="absolute text-[var(--app-text-muted)] left-0 top-1/2 -translate-y-1/2 bg-transparent border-none hover:bg-transparent cursor-pointer">
            <SearchIcon className="size-5" />
          </Button>
        </div>

        <div className="w-[140px] shrink-0">
          <Select>
            <SelectTrigger className="w-full bg-[#EDFCFE0F]  rounded-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none px-4 py-6">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>

            <SelectContent className="bg-(--app-bg)  text-foreground border border-border/10 outline-none focus:outline-none focus:ring-0 focus:border-none">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="unpopular">Unpopular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="shrink-0">
        <ConnectWallet />
        {/* <ConnectButton
          chainStatus={{
            smallScreen: "icon",
            largeScreen: "full",
          }}
        /> */}
      </div>
    </div>
  );
};

export default Header;
