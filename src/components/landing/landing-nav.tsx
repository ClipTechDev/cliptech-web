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

const NAV_ITEMS = [
  { name: "How it works", link: "#how-it-works" },
  { name: "Features", link: "#features" },
  { name: "FAQ", link: "#faq" },
];

export function LandingNav({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} />
        <NavbarButton href={ctaHref} variant="gradient">
          {ctaLabel}
        </NavbarButton>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle isOpen={open} onClick={() => setOpen((value) => !value)} />
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
          <NavbarButton href={ctaHref} variant="gradient" className="w-full py-3">
            {ctaLabel}
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
