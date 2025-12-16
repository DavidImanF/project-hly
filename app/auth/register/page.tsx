"use client";

import { useState, ChangeEvent } from "react";
import { db, auth } from "@/firebaseConfig";
import { createUserWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Register() {
    const router = useRouter();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [nama, setNama] = useState<string>("");
    const [telepon, setTelepon] = useState<string>("");
    const [alamat, setAlamat] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleRegister = async () => {
        if (!email || !password || !nama || !telepon || !alamat) {
            return alert("Semua field wajib diisi!");
        }

        setLoading(true);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const user: User = res.user;

            // Simpan data user lengkap ke Firestore
            await setDoc(doc(db, "users", user.uid), {
                email,
                nama,
                telepon,
                alamat,
                role: "user",
                createdAt: Date.now(),
            });

            alert("Registrasi berhasil!");
            router.push("/auth/login");
        } catch (err: any) {
            alert("Registrasi gagal: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-lime-100 via-white to-gray-100 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 animate-fadeIn">
                <h1 className="text-4xl font-extrabold text-lime-700 text-center mb-2">
                    Daftar Akun
                </h1>

                <p className="text-center text-gray-700 mb-6">
                    Silakan buat akun baru untuk mulai berbelanja
                </p>

                {/* Nama */}
                <input
                    type="text"
                    value={nama}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNama(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none transition duration-300 text-gray-800"
                />

                {/* Telepon */}
                <input
                    type="tel"
                    value={telepon}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTelepon(e.target.value)}
                    placeholder="Nomor Telepon"
                    className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none transition duration-300 text-gray-800"
                />

                {/* Alamat */}
                <textarea
                    value={alamat}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAlamat(e.target.value)}
                    placeholder="Alamat Lengkap"
                    className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none transition duration-300 text-gray-800 resize-none"
                    rows={3}
                />

                {/* Email */}
                <input
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none transition duration-300 text-gray-800"
                />

                {/* Password */}
                <input
                    type="password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none transition duration-300 text-gray-800"
                />

                {/* Register Button */}
                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg text-white font-semibold mb-4 
                        ${loading ? "bg-lime-300 cursor-not-allowed" : "bg-lime-600 hover:bg-lime-700"} 
                        transition duration-300`}
                >
                    {loading ? "Memuat..." : "Register"}
                </button>

                <p className="text-center text-gray-700 mt-4">
                    Sudah punya akun?{" "}
                    <a
                        href="/auth/login"
                        className="text-lime-600 font-semibold hover:underline"
                    >
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
