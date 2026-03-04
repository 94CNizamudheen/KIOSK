import { Plus } from "lucide-react";
import type { Product } from "@/types/product";
import menuTemplate from "@assets/dish-placeholder.jpg";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

function getProductImage(media?: string): string | null {
  if (!media) return null;
  try {
    const parsed = JSON.parse(media) as { filepath: string }[];
    return parsed[0]?.filepath ?? null;
  } catch {
    return null;
  }
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const imgSrc = getProductImage(product.media);

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col cursor-pointer group"
      onClick={() => onAdd(product)}
    >
      {/* Image */}
      <div className="h-36 bg-gray-100 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "";
              e.currentTarget.parentElement!.classList.add(
                "flex",
                "items-center",
                "justify-center",
              );
            }}
          />
        ) : (
          <div className="w-full h-full object-cover">
            <img
              src={menuTemplate}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "";
                e.currentTarget.parentElement!.classList.add(
                  "flex",
                  "items-center",
                  "justify-center",
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
          {product.name}
        </p>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-1">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-green-500 font-bold text-base">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-green-500 flex items-center justify-center transition-all duration-200 group-hover:text-white text-gray-500"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
