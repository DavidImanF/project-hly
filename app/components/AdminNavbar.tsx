"use client";

import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { JSX } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default function AdminNavbar(): JSX.Element {
    const router = useRouter();

    const logout = async (): Promise<void> => {
        try {
            await signOut(auth); // sign out Firebase
        } catch (err) {
            console.warn("signOut err:", err);
        }

        // hapus cookies + localStorage
        deleteCookie("token");
        deleteCookie("role");
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        router.push("/auth/login");
    };

    return (
        <div className="w-full h-16 bg-white shadow fixed left-64 top-0 flex items-center justify-between px-8">
            <h2 className="text-xl font-semibold text-black">Dashboard Admin</h2>

            <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded"
            >
                Logout
            </button>
        </div>
    );
}
