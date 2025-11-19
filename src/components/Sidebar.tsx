"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Activity, Utensils, BookOpen, Settings, LogOut } from "lucide-react";

// Mock modules for now - in real app this comes from DB/Context
const AVAILABLE_MODULES = [
    { id: "finance", name: "Finance", slug: "/finance", icon: Wallet },
    { id: "health", name: "Health", slug: "/health", icon: Activity },
    { id: "nutrition", name: "Nutrition", slug: "/nutrition", icon: Utensils },
    { id: "studies", name: "Studies", slug: "/studies", icon: BookOpen },
];

// Mock user active modules (fetch this from user_modules table later)
const USER_ACTIVE_MODULES = ["finance"];

export function Sidebar() {
    const pathname = usePathname();

    const activeModules = AVAILABLE_MODULES.filter((m) =>
        USER_ACTIVE_MODULES.includes(m.id)
    );

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-zinc-800 bg-zinc-950 transition-transform sm:translate-x-0">
            <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
                {/* Logo */}
                <div className="mb-10 flex items-center pl-2.5">
                    <span className="self-center whitespace-nowrap text-2xl font-bold tracking-tighter text-white">
                        ZARK <span className="text-primary">.</span>
                    </span>
                </div>

                {/* Main Navigation */}
                <ul className="space-y-2 font-medium">
                    <li>
                        <Link
                            href="/dashboard"
                            className={`group flex items-center rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white ${pathname === "/dashboard" ? "bg-zinc-900 text-white" : ""
                                }`}
                        >
                            <Home className="h-5 w-5 flex-shrink-0 transition duration-75 group-hover:text-white" />
                            <span className="ml-3">Visão Geral</span>
                        </Link>
                    </li>

                    {/* Dynamic Modules */}
                    <div className="my-4 border-t border-zinc-800 pt-4">
                        <span className="px-2 text-xs font-semibold uppercase text-zinc-500">
                            Módulos
                        </span>
                        <div className="mt-2 space-y-2">
                            {activeModules.map((module) => {
                                const Icon = module.icon;
                                const isActive = pathname.startsWith(module.slug);
                                return (
                                    <Link
                                        key={module.id}
                                        href={module.slug}
                                        className={`group flex items-center rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white ${isActive ? "bg-zinc-900 text-white" : ""
                                            }`}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0 transition duration-75 group-hover:text-white" />
                                        <span className="ml-3">{module.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </ul>

                {/* Footer / Settings */}
                <div className="mt-auto border-t border-zinc-800 pt-4">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link
                                href="/settings"
                                className="group flex items-center rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            >
                                <Settings className="h-5 w-5 flex-shrink-0 transition duration-75 group-hover:text-white" />
                                <span className="ml-3">Configurações</span>
                            </Link>
                        </li>
                        <li>
                            <button className="group flex w-full items-center rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
                                <LogOut className="h-5 w-5 flex-shrink-0 transition duration-75 group-hover:text-white" />
                                <span className="ml-3">Sair</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
    );
}
