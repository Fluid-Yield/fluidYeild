import Image from "next/image";
import FY_logo from "@/public/nirLogoWhite.png";

export default function Footer() {
  return (
    <footer className="border-t border-[#132225]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Image
            src={FY_logo}
            alt="Fluid Yield"
            width={36}
            height={36}
            className="w-8 h-8"
          />
          <div className="text-sm ">
            <p>Fluid Yield — clarity-first strategy tooling.</p>
            <p className="mt-1">
              © {new Date().getFullYear()} Fluid Yield. All rights reserved.
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/dashboard" className=" hover:text-accent-foreground">
            App
          </a>
          <a href="/dashboard/learn" className=" hover:text-accent-foreground">
            Learn
          </a>
          <a
            href="/dashboard/settings"
            className=" hover:text-accent-foreground"
          >
            Settings
          </a>
        </nav>
      </div>
    </footer>
  );
}
