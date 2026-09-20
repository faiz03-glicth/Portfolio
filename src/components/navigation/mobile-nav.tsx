"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { mainNav } from "@/config/navigation";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";
import { NavLink } from "./nav-link";

/** Navigation drawer for narrow viewports. Reuses `Modal` in drawer mode. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden"
      >
        <Menu />
      </IconButton>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Navigation"
        variant="drawer"
      >
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <NavLink
                  item={item}
                  onNavigate={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-surface"
                >
                  <item.icon aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </Modal>
    </>
  );
}
