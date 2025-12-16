"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { Home, PackageSearch, LogOut, Wrench } from "lucide-react";
import React, { JSX } from "react";

export default function AdminSidebar(): JSX.Element {
    const path = usePathname();
    const router = useRouter();

    interface MenuItem {
        label: string;
        href: string;
        icon: JSX.Element;
    }

    const menu: MenuItem[] = [
        { label: "Dashboard", href: "/admin/dashboard", icon: <Home size={18} /> },
        { label: "Products", href: "/admin/products", icon: <PackageSearch size={18} /> },
        { label: "Maintenance", href: "/admin/maintenance", icon: <Wrench size={18} /> },
    ];

    const logout = async () => {
        await signOut(auth);
        deleteCookie("token");
        deleteCookie("role");
        localStorage.clear();
        router.push("/");
    };

    return (
        <div className="w-64 h-screen fixed left-0 top-0 bg-white/80 backdrop-blur-2xl border-r p-6 flex flex-col text-black">
            <h1 className="text-2xl font-extrabold mb-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Panel
            </h1>

            <div className="flex flex-col gap-2 flex-grow">
                {menu.map((m) => (
                    <Link
                        key={m.href}
                        href={m.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl
              ${path === m.href
                                ? "bg-blue-600 text-white"
                                : "hover:bg-blue-50"
                            }`}
                    >
                        {m.icon}
                        {m.label}
                    </Link>
                ))}
            </div>

            <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl"
            >
                <LogOut size={18} /> Logout
            </button>
        </div>
    );
}
