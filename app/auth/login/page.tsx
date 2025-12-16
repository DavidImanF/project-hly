"use client";

import { useState, ChangeEvent } from "react";
import { auth, db } from "@/firebaseConfig";
import {
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { setCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const provider = new GoogleAuthProvider();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ===== CEK MAINTENANCE =====
    const checkMaintenance = async (role: string) => {
        const configSnap = await getDoc(doc(db, "config", "site"));
        const maintenance = configSnap.data()?.maintenance === true;

        // ❌ USER DITOLAK SAAT MAINTENANCE
        if (maintenance && role !== "admin") {
            await signOut(auth);

            deleteCookie("token");
            deleteCookie("role");
            localStorage.clear();

            alert("🚧 Website sedang maintenance. Silakan coba lagi nanti.");
            return false;
        }

        return true;
    };

    // ===== LOGIN EMAIL =====
    const loginEmail = async () => {
        if (!email || !password) {
            alert("Email dan password wajib diisi!");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;
            await handleAuthSuccess(user);
        } catch (err: any) {
            alert("Login gagal: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ===== LOGIN GOOGLE =====
    const loginGoogle = async () => {
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            if (!snap.exists()) {
                await setDoc(userRef, {
                    email: user.email,
                    role: "user",
                });
            }

            await handleAuthSuccess(user);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ===== HANDLE LOGIN SUCCESS =====
    const handleAuthSuccess = async (user: User) => {
        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
            alert("Akun tidak memiliki role!");
            await signOut(auth);
            return;
        }

        const role = userSnap.data().role;

        // 🔥 CEK MAINTENANCE DI SINI
        const allowed = await checkMaintenance(role);
        if (!allowed) return;

        const token = await user.getIdToken();

        setCookie("token", token);
        setCookie("role", role);

        localStorage.setItem(
            "user",
            JSON.stringify({
                uid: user.uid,
                email: user.email,
                role,
            })
        );

        if (role === "admin") router.push("/admin/dashboard");
        else router.push("/user/home");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-lime-100 via-white to-gray-100 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10">
                <h1 className="text-4xl font-extrabold text-lime-700 text-center mb-6">
                    Selamat Datang
                </h1>

                <input
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                    }
                    placeholder="Email"
                    className="w-full px-4 py-3 mb-4 border rounded-lg text-black"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                    }
                    placeholder="Password"
                    className="w-full px-4 py-3 mb-4 border rounded-lg text-black"
                />

                <button
                    onClick={loginEmail}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-semibold mb-4 ${loading
                            ? "bg-lime-300 cursor-not-allowed"
                            : "bg-lime-600 hover:bg-lime-700"
                        } text-white`}
                >
                    {loading ? "Memuat..." : "Login"}
                </button>

                <p className="text-center text-gray-700">
                    Belum punya akun?{" "}
                    <Link
                        href="/auth/register"
                        className="text-lime-600 font-semibold hover:underline"
                    >
                        Daftar
                    </Link>
                </p>
            </div>
        </div>
    );
}
