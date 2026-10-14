import { ArchiveIcon, FileIcon, PaperPlaneTiltIcon, TrashIcon, TrayIcon } from "phosphor-svelte";
import type { Component } from "svelte";

export type NavItem = {
    title: string;
    url: string;
    icon: Component;
    isActive?: boolean;
};

export type User = {
    name: string;
    email: string;
    avatar: string;
};

export const user: User = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
};

export const navMain: NavItem[] = [
    {
        title: "Inbox",
        url: "##",
        icon: TrayIcon,
        isActive: true,
    },
    {
        title: "Drafts",
        url: "##",
        icon: FileIcon,
        isActive: false,
    },
    {
        title: "Sent",
        url: "##",
        icon: PaperPlaneTiltIcon,
        isActive: false,
    },
    {
        title: "Junk",
        url: "##",
        icon: ArchiveIcon,
        isActive: false,
    },
    {
        title: "Trash",
        url: "##",
        icon: TrashIcon,
        isActive: false,
    },
];
