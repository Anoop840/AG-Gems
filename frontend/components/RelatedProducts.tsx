// frontend/components/RelatedProducts.tsx
import { useEffect, useState } from "react";
import ProductCard from "./product-card";
import { api } from "@/lib/api";

interface Product {
  _id: string;
  image: string;
  title: string;
  price: number;
  category: string;
}

export function RelatedProducts({ productId }: { productId: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/related`);
      const data = await res.json();
      setProducts(data);
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
            id={product._id}
            image={product.image}
            title={product.title}
            price={product.price}
            category={product.category}
          />
        ))}
      </div>
    </div>
  );
}
