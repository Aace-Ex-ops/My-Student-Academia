import React from "react";
import { ProfileDropdown } from "./ui/profile-dropdown";
import { User } from "@/types";

interface TopbarProps {
  currentUser?: User | null;
  onSwitchUser?: (userId: string) => void;
  users?: User[];
}

export function Topbar({ currentUser, onSwitchUser, users = [] }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#0E0E12]/80 backdrop-blur-xl border-b border-[#F5E7C6]/15 px-4 sm:px-6 py-3 flex items-center justify-end shadow-md">
      <ProfileDropdown
        currentUser={currentUser}
        onSwitchUser={onSwitchUser}
        users={users}
        isCollapsed={false}
      />
    </header>
  );
}
