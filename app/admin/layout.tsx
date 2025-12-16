"use client";

import React, { JSX, ReactNode } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
// import AdminNavbar from "@/app/components/AdminNavbar";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
    return (
        <div className="flex bg-gray-50 min-h-screen">

            {/* SIDEBAR — selalu terbuka */}
            <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50">
                <AdminSidebar />
            </div>

            {/* MAIN CONTENT */}
            <div className="flex flex-col w-full ml-64">

                {/* NAVBAR
                <div className="sticky top-0 z-40">
                    <AdminNavbar />
                </div> */}

                {/* CONTENT */}
                <div className="p-6 pt-24">
                    {children}
                </div>

            </div>
        </div>
    );
}
