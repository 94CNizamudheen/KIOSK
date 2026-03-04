import { useState } from "react";
import { Plus } from "lucide-react";
import { mockCombinations } from "@data/mockCombinations";
import promoVideo from "@assets/barbecue-restaurant-menu-food-promo-sale.mp4";
import type { CartItem, Product } from "@/types/product";
import CartSidebar from "@ui/components/CartSidebar";
import menuTemplate from "@assets/dish-placeholder.jpg";
// ─── Types ────────────────────────────────────────────────────────────────────

type View = "home" | "category";

interface SelectedCategory {
  id: string;
  name: string;
  groupId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProductImage(media?: string): string | null {
  if (!media || media === "[]") return null;
  try {
    const parsed = JSON.parse(media) as { filepath: string }[];
    return parsed[0]?.filepath ?? null;
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryCard({
  name,
  media,
  badge,
  onClick,
}: {
  name: string;
  media?: string;
  badge?: string;
  onClick: () => void;
}) {
  const img = getProductImage(media);
  return (
    <button
      onClick={onClick}
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 text-left w-full"
      style={{ backgroundColor: "#E5E5DF" }}
    >
      <div className="w-full h-28 overflow-hidden bg-gray-200 flex items-center justify-center">
        <img src={img || menuTemplate} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="px-3 py-2">
        <p className="font-extrabold text-gray-900 text-sm">{name}</p>
        {badge && (
          <span
            className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 text-black"
            style={{ backgroundColor: "#B5E533" }}
          >
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const img = getProductImage(product.media);
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
      style={{ backgroundColor: "#E5E5DF" }}
      onClick={() => onAdd(product)}
    >
      <div className="h-36 bg-gray-200 flex items-center justify-center overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={menuTemplate}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-3 flex items-end justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-gray-900 text-sm line-clamp-2 leading-tight">
            {product.name}
          </p>
          <p className="text-sm font-bold text-gray-600 mt-0.5">
            ${product.price.toFixed(2)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-black transition-colors hover:opacity-80 shrink-0"
          style={{ backgroundColor: "#B5E533" }}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Menu ────────────────────────────────────────────────────────────────

export default function Menu() {
  const [view, setView] = useState<View>("home");
  const [selectedCat, setSelectedCat] = useState<SelectedCategory | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const allCategories = mockCombinations.flatMap((g) =>
    g.categories.map((c) => ({ ...c, groupId: g.id, products: c.products })),
  );

  const currentProducts = selectedCat
    ? (
        allCategories.find((c) => c.id === selectedCat.id)?.products ?? []
      ).filter((p) => p.active && !p.is_sold_out)
    : [];

  function handleAdd(product: Product) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { ...product, qty: 1 }];
    });
  }
  function handleIncrease(id: string) {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
    );
  }
  function handleDecrease(id: string) {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    );
  }
  function handleRemove(id: string) {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }

  function selectCategory(cat: { id: string; name: string; groupId: string }) {
    setSelectedCat(cat);
    setView("category");
  }

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <div
      className="h-screen w-screen flex overflow-hidden p-3 gap-3"
      style={{ backgroundColor: "#D8D8D3" }}
    >
      {view === "home" ? (
        <>
          {/* ── LEFT: Categories (50%) ── */}
          <div
            className="w-1/2 rounded-3xl flex flex-col p-6 overflow-y-auto shrink-0"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <span
                className="text-3xl"
                style={{ fontFamily: "'Pacifico', cursive", color: "#1C1C1C" }}
              >
                Delicious
              </span>
              <span className="w-8 h-8 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-0.5">
              Hey,
            </h2>
            <p className="text-2xl font-extrabold text-gray-900 mb-5">
              What's up ?
            </p>

            {/* Category grid — 3 cols */}
            <div className="grid grid-cols-3 gap-3">
              {allCategories.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  name={cat.name}
                  media={cat.media}
                  badge={i === 0 ? "20% off" : undefined}
                  onClick={() =>
                    selectCategory({
                      id: cat.id,
                      name: cat.name,
                      groupId: cat.groupId,
                    })
                  }
                />
              ))}
            </div>
          </div>

          {/* ── CENTER: Promo (22%) ── */}
          <div className="w-[22%] rounded-3xl overflow-hidden flex flex-col shrink-0">
            {/* Green promo banner */}
            <div
              className="flex-1 flex flex-col justify-center px-6 py-8"
              style={{ backgroundColor: "#B5E533" }}
            >
              <p className="text-white text-xl font-bold mb-1">Friends meal</p>
              <p
                className="text-black font-extrabold leading-none"
                style={{ fontSize: "clamp(3rem,6vw,5rem)" }}
              >
                20%
              </p>
              <p
                className="text-black font-extrabold mb-5"
                style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
              >
                off
              </p>
              <button
                className="self-start px-6 py-2.5 rounded-full bg-black text-white font-bold text-sm hover:opacity-80 transition-opacity"
                onClick={() => {
                  const first = allCategories[0];
                  if (first)
                    selectCategory({
                      id: first.id,
                      name: first.name,
                      groupId: first.groupId,
                    });
                }}
              >
                Order now
              </button>
            </div>

            {/* Hero promo video */}
            <div className="flex-1 overflow-hidden">
              <video
                src={promoVideo}
                className="w-full h-full object-fill"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </>
      ) : (
        /* ── CATEGORY VIEW: Left+Center merged (72%) ── */
        <div
          className="flex-1 rounded-3xl flex flex-col p-6 overflow-y-auto"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-3xl"
              style={{ fontFamily: "'Pacifico', cursive", color: "#1C1C1C" }}
            >
              Delicious
            </span>
            <button
              onClick={() => setView("home")}
              className="px-5 py-2 rounded-full border-2 border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              Main menu?
            </button>
          </div>

          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
            {selectedCat?.name}
          </h2>

          {currentProducts.length === 0 ? (
            <p className="text-gray-400 text-lg mt-8">No items available</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {currentProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CART: Right (28%) ── */}
      <div
        className="w-[28%] rounded-3xl overflow-hidden shrink-0"
        style={{ backgroundColor: "#F1F1EC" }}
      >
        <CartSidebar
          cartItems={cartItems}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}
