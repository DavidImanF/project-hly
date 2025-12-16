"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface Props {
    open: boolean;
    setOpen: (val: boolean) => void;
    showToggle?: boolean;
}

export default function UserSidebar({ open, setOpen, showToggle = true, }: Props) {
    const router = useRouter();
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    // -----------------------------
    // Mouse auto open/close sidebar
    // -----------------------------
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const mouseX = e.clientX;

            if (mouseX < 40) setOpen(true);
            if (open && mouseX > 260) setOpen(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [open, setOpen]);

    return (
        <>
            {/* 🔥 TOMBOL HAMBURGER - MUNCUL HANYA KETIKA SIDEBAR TERTUTUP */}
            {showToggle && !open && (
                <button
                    onClick={() => setOpen(true)}
                    className="
            fixed top-4 left-4 z-[9999] 
            bg-white shadow-md rounded-md p-2 
            hover:bg-gray-100 active:scale-95 transition
        "
                >
                    {/* Ikon garis tiga */}
                    <div className="space-y-1">
                        <span className="block w-6 h-0.5 bg-black"></span>
                        <span className="block w-6 h-0.5 bg-black"></span>
                        <span className="block w-6 h-0.5 bg-black"></span>
                    </div>
                </button>
            )}


            {/* -----------------------------
                SIDEBAR
            ----------------------------- */}
            <div
                className={`
                    fixed top-0 left-0 h-screen bg-white
                    transition-all duration-300 overflow-hidden
                    ${open ? "w-64 shadow-lg p-6" : "w-0 p-0 shadow-none"}
                `}
            >
                {/* Sembunyikan konten jika sidebar menutup */}
                <div
                    className={`${open ? "opacity-100" : "opacity-0 hidden"
                        } transition-opacity duration-300`}
                >
                    <h2 className="text-2xl font-bold text-lime-700 mb-10">HLY STORE</h2>

                    <nav className="flex flex-col gap-4 text-gray-700 font-medium">
                        <Link href="/user/home" className="hover:text-lime-600">🛍️ Semua Produk</Link>
                        <Link href="/user/cart" className="hover:text-lime-600">🛒 Keranjang</Link>
                        <Link href="/user/profile" className="hover:text-lime-600">👤 Profil</Link>

                        {/* Logout membuka popup konfirmasi */}
                        <button
                            onClick={() => setShowLogoutPopup(true)}
                            className="mt-6 py-2 text-left text-red-600 font-semibold hover:text-red-700"
                        >
                            🚪 Logout
                        </button>
                    </nav>
                </div>
            </div>

            {/* -----------------------------
                POPUP LOGOUT
            ----------------------------- */}
            {showLogoutPopup && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]"
                    onClick={() => setShowLogoutPopup(false)}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg w-80"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4 text-black">Konfirmasi Logout</h3>
                        <p className="text-gray-600 mb-6">Yakin mau logout?</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutPopup(false)}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-black"
                            >
                                Batal
                            </button>

                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
