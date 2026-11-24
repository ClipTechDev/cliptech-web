"use client";

import * as React from "react";

import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
  NavbarButton,
  NavbarLogo,
} from "@/components/ui/resizable-navbar";
import { ThemeSwitch } from "@/components/shared/theme-switch";

const NAV_ITEMS = [
  { name: "How it works", link: "#how-it-works" },
  { name: "Targeting", link: "#targeting" },
  { name: "Integrity", link: "#integrity" },
  { name: "FAQ", link: "#faq" },
];

export function BusinessNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} />
        <div className="relative z-20 flex items-center gap-tight">
          <ThemeSwitch />
          <NavbarButton href="#proposal" variant="gradient">
            Get a proposal
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center">
            <ThemeSwitch className="size-11" />
            <MobileNavToggle
              isOpen={open}
              onClick={() => setOpen((value) => !value)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.link}
              href={item.link}
              onClick={() => setOpen(false)}
              className="flex min-h-11 w-full items-center text-base text-foreground"
            >
              {item.name}
            </a>
          ))}
          <NavbarButton
            href="#proposal"
            variant="gradient"
            className="w-full py-3"
            onClick={() => setOpen(false)}
          >
            Get a proposal
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
