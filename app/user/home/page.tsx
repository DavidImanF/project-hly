"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import UserSidebar from "@/app/components/UserSidebar";

interface Produk {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
}

export default function UserHome() {
    const [produk, setProduk] = useState<Produk[]>([]);
    const [openSidebar, setOpenSidebar] = useState(false);

    // 🔹 REF UNTUK SCROLL
    const produkRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const snap = await getDocs(collection(db, "products"));
            setProduk(
                snap.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Produk, "id">),
                }))
            );
        };
        fetchData();
    }, []);

    return (
        <>
            {/* SIDEBAR */}
            <UserSidebar open={openSidebar} setOpen={setOpenSidebar} />

            {/* MAIN CONTENT */}
            <div
                className={`
                    min-h-screen transition-all duration-300
                    ${openSidebar ? "ml-64" : "ml-0"}
                `}
            >
                {/* 🔥 HERO SECTION */}
                <section className="bg-gradient-to-b from-lime-100 via-white to-gray-100 px-6 pt-16 pb-24">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-14">

                        {/* TEXT */}
                        <div className="md:w-1/2 text-center md:text-left">
                            <h1 className="text-5xl md:text-6xl font-extrabold text-lime-700 mb-6 leading-tight">
                                HLY DAILY STORE
                            </h1>

                            <p className="text-gray-700 text-lg md:text-xl mb-8">
                                Selamat datang kembali 👋 <br />
                                Kami menyediakan berbagai produk pilihan dengan kualitas terbaik. <br />
                                Jelajahi koleksi kami dan kunjungi toko Offline HLY Daily Store untuk pengalaman belanja langsung.
                            </p>

                            {/* BUTTON SCROLL */}
                            <button
                                onClick={() =>
                                    produkRef.current?.scrollIntoView({
                                        behavior: "smooth",
                                    })
                                }
                                className="
                    bg-lime-600 hover:bg-lime-700
                    text-white font-semibold px-10 py-4 rounded-full
                    shadow-lg transition transform hover:scale-105
                "
                            >
                                Lihat Produk
                            </button>
                        </div>

                        {/* HERO IMAGE + LOKASI */}
                        <div className="md:w-1/2 w-full flex flex-col items-center">
                            <img
                                src="/hero.jpg"
                                alt="HLY Daily Store"
                                className="
                    w-full max-w-xs
                    rounded-2xl shadow-xl object-cover
                    transition-transform duration-500
                    hover:scale-105
                "
                            />

                            {/* INFO LOKASI DI BAWAH GAMBAR */}
                            <p className="mt-5 text-gray-600 text-sm text-center">
                                📍 <span className="font-semibold">Lokasi Toko Offline</span> —{" "}
                                <a
                                    href="https://maps.app.goo.gl/jBpzJQgK1xsy24gBA"
                                    target="_blank"
                                    className="text-lime-700 font-semibold hover:underline"
                                >
                                    Lihat lokasi di Google Maps
                                </a>
                            </p>
                        </div>
                    </div>
                </section>




                {/* 🔥 PRODUK SECTION */}
                <section
                    ref={produkRef}
                    className="bg-gray-100 px-6 pb-20 pt-12"
                >
                    <h2 className="text-4xl font-extrabold text-center text-lime-700 mb-12">
                        Produk Kami
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {produk.map((item) => (
                            <Link
                                href={`/user/product/${item.id}`}
                                key={item.id}
                                className="
                                    group relative border rounded-xl overflow-hidden
                                    shadow-md bg-white transition-all duration-300
                                    hover:scale-105 hover:shadow-2xl
                                "
                            >
                                <div className="relative w-full h-64 overflow-hidden">
                                    <img
                                        src={item.imageUrl || "/no-image.png"}
                                        alt={item.name}
                                        className="
                                            w-full h-full object-cover
                                            transition-transform duration-500
                                            group-hover:scale-110
                                        "
                                    />
                                </div>

                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-lime-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-gray-600 font-medium">
                                        Rp {item.price.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 🔥 FOOTER */}
                <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} HLY DAILY STORE. All rights reserved.
                </footer>
            </div>
        </>
    );
}
