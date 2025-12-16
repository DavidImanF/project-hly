"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface UserData {
    name: string;
    email: string;
    phone: string;
    alamat: string;
}

export default function Profile() {
    const { user } = useUser();
    const [dataUser, setDataUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const modalRef = useRef<HTMLDivElement | null>(null);

    // Ambil data Firestore
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data();
                setDataUser({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    alamat: data.alamat,
                });
            }

            setLoading(false);
        };

        fetchUserData();
    }, [user]);

    // Tutup modal jika klik di luar
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                window.history.back();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const closeModal = () => {
        window.history.back();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-6 border border-gray-100 relative animate-fadeIn"
            >
                {/* Tombol Close */}
                <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
                >
                    ×
                </button>

                <h1 className="text-3xl font-extrabold text-lime-700 mb-6 text-center">
                    Profil Pengguna
                </h1>

                {!user && (
                    <p className="text-center text-gray-500">Tidak ada data user.</p>
                )}

                {loading && (
                    <p className="text-center text-gray-500">Memuat data...</p>
                )}

                {user && dataUser && (
                    <div className="space-y-4">

                        <div className="bg-lime-50 p-4 rounded-xl border border-lime-200">
                            <p className="text-sm text-gray-600">Nama Lengkap</p>
                            <p className="font-semibold text-gray-800">{dataUser.name}</p>
                        </div>

                        <div className="bg-lime-50 p-4 rounded-xl border border-lime-200">
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold text-gray-800">{dataUser.email}</p>
                        </div>

                        <div className="bg-lime-50 p-4 rounded-xl border border-lime-200">
                            <p className="text-sm text-gray-600">Nomor Telepon</p>
                            <p className="font-semibold text-gray-800">
                                {dataUser.phone || "(Tidak ada nomor)"}
                            </p>
                        </div>

                        <div className="bg-lime-50 p-4 rounded-xl border border-lime-200">
                            <p className="text-sm text-gray-600">Alamat</p>
                            <p className="font-semibold text-gray-800">
                                {dataUser.alamat || "(Tidak ada alamat)"}
                            </p>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
