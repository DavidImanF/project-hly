"use client";

import { JSX, useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";
import { Wrench } from "lucide-react";

// ====================
// TYPE
// ====================
interface Product {
  id: string;
  name?: string;
  price?: number;
  imageUrl?: string;
  [key: string]: any;
}

export default function LandingPage(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [maintenance, setMaintenance] = useState<boolean | null>(null);

  // ====================
  // CHECK MAINTENANCE
  // ====================
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const snap = await getDoc(doc(db, "config", "site"));
        setMaintenance(snap.exists() && snap.data().maintenance === true);
      } catch {
        // fallback aman
        setMaintenance(false);
      }
    };

    checkMaintenance();
  }, []);

  // ====================
  // FETCH PRODUCTS (ONLY IF NOT MAINTENANCE)
  // ====================
  useEffect(() => {
    if (maintenance !== false) return;

    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      setProducts(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as DocumentData),
        }))
      );
    };

    fetchProducts();
  }, [maintenance]);

  // ====================
  // LOADING STATE
  // ====================
  if (maintenance === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // ====================
  // MAINTENANCE PAGE
  // ====================
  if (maintenance === true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black px-6">
        <div className="text-center max-w-xl">
          <div className="flex justify-center mb-6">
            <Wrench size={72} className="text-yellow-400 animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Website Sedang Maintenance
          </h1>

          <p className="text-gray-300 text-lg mb-8">
            Kami sedang melakukan peningkatan sistem demi pengalaman belanja
            yang lebih baik.
            <br />
            Silakan kembali beberapa saat lagi 🙏
          </p>

          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} HLY DAILY STORE
          </p>
        </div>
      </div>
    );
  }

  // ====================
  // NORMAL LANDING PAGE
  // ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-100 via-white to-gray-100 px-6 pb-12">
      {/* HERO */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 pt-12">
        <div className="text-center md:text-left max-w-xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-lime-700 mb-4">
            HLY DAILY STORE
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Temukan berbagai produk pilihan kami dengan pengalaman belanja
            terbaik.
          </p>

          <Link
            href="/auth/login"
            className="inline-block bg-lime-600 hover:bg-lime-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg transition"
          >
            Login & Mulai Belanja
          </Link>
        </div>

        <div className="mt-8 md:mt-0 md:w-1/2 flex justify-center">
          <img
            src="/hero.jpg"
            alt="Hero"
            className="w-full max-w-sm h-[420px] object-cover rounded-2xl shadow-xl"
          />
        </div>
      </header>

      {/* PRODUCTS */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-black">
          Produk Unggulan
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl overflow-hidden shadow bg-white hover:scale-105 transition text-black"
            >
              <div className="h-64">
                <img
                  src={p.imageUrl || "/no-image.png"}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-gray-600">
                  Rp {(p.price ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} HLY DAILY STORE
      </footer>
    </div>
  );
}
