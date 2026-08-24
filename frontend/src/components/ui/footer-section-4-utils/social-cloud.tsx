import React from "react";
import { Twitter, Linkedin, Facebook, Instagram, Youtube, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialCloudProps {
  className?: string;
}

export function SocialCloud({ className }: SocialCloudProps) {
  const socials = [
    { icon: Twitter, label: "X", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Facebook, label: "Facebook", href: "#" },
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Youtube, label: "Youtube", href: "#" },
  ];

  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      {socials.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.label}
            href={social.href}
            aria-label={social.label}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
}
