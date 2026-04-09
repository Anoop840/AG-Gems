// frontend/components/RelatedProducts.tsx
import { useEffect, useState } from "react";
import ProductCard from "./product-card";
import { Product, productAPI } from "@/lib/api";

export function RelatedProducts({ productId }: { productId: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      const response = await productAPI.getRelatedProducts(productId);
      setProducts(response.products || []);
    };
    fetchRelated();
  }, [productId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
