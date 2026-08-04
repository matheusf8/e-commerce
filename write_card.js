const fs = require("fs");
const content = `import React from "react";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: any;
  onAddToCart?: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
}

export function ProductCard({ product, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const imgSrc = product.image_url || "/placeholder.jpg";

  return (
    <Card className="overflow-hidden group hover-lift">
      <div className="relative bg-gray-100 h-64 image-zoom">
        <Link to={"/product/" + product.id}>
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-gray-400 text-center">
                <ShoppingCart size={48} className="mx-auto mb-2" />
                <span className="text-sm">Imagem indisponivel</span>
              </div>
          ) : (
            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" loading="lazy" onError={function() { setImageError(true); }} />
          )}
        </Link>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3">
          <Link to={"/product/" + product.id}>
            <button className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white"><Eye size={20} /></button>
          </Link>
          <button onClick={function() { setIsWishlisted(!isWishlisted); onAddToWishlist?.(product.id); }} className={"p-3 rounded-full " + (isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-700 hover:bg-red-500 hover:text-white")}>
            <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
          </button>
        </div>
        {product.is_featured && <div className="absolute top-3 left-3"><span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Destaque</span></div>}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold shadow-md bg-blue-100 text-blue-700">{product.category}</span>
        </div>
      <div className="p-5">
        <Link to={"/product/" + product.id}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 text-lg">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            {[...Array(5)].map(function(_, i) {
              return <Star key={i} size={16} className={i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />;
            })}
          </div>
          <span className="text-sm text-gray-500 font-medium">({product.review_count})</span>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-blue-600">R$ {product.price.toFixed(2)}</span>
        </div>
        <div className="flex gap-2 mt-5">
          <Link to={"/product/" + product.id} className="flex-1">
            <Button size="sm" variant="outline" className="w-full"><Eye size={16} /> Detalhes</Button>
          </Link>
          <Button size="sm" className="flex-1 flex items-center justify-center gap-2" onClick={function() { onAddToCart?.(product.id); }} disabled={product.stock === 0}>
            <ShoppingCart size={16} /> {product.stock === 0 ? "Indisponivel" : "Comprar"}
          </Button>
        </div>
    </Card>
  );
}
`;
fs.writeFileSync("c:/Users/mathe/OneDrive/Desktop/area_trabalho/pasta/sistema-de-E-commerce/frontend/src/components/product/ProductCard.tsx", content, "utf8");
console.log("OK");
