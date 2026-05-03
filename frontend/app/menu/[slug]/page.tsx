"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";
import getMenuBySlug from "@/app/(api)/getMenuBySlug";
import { ProductType } from "@/types/Types";
import { MenuDetailsSkeleton } from "@/components/skeletons/MenuDetailsSkeleton";

interface MenuDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default function MenuDetailsPage({ params }: MenuDetailsPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    async function fetchMenu() {
      const data = await getMenuBySlug(slug);
      if (data?.menuItem) {
        setProduct(data.menuItem);
      }
      setLoading(false);
    }

    fetchMenu();
  }, [slug]);

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.slug,
      name: product.title,
      price: product.price,
      imageUrl: product.image,
      quantity,
    });
  };

  const increaseQty = () => setQuantity((prev) => prev + 1);
  const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));

  if (loading) {
    return <MenuDetailsSkeleton />;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-0 py-10 flex flex-col  md:flex-row gap-10">
      {/* LEFT */}
      <div className="basis-2/5 w-full md:sticky md:top-10">
        <div className="relative w-full h-80  overflow-hidden rounded-xl border">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="basis-3/5 w-full space-y-5">
        {/* TITLE */}
        <div className="space-y-2.5">
          <h1 className="text-2xl font-bold">{product.title}</h1>

          <h2 className="text-muted-foreground capitalize">
            {product.category}
          </h2>
        </div>

        {/* DESCRIPTION */}
        <p className="max-w-prose">{product.description}</p>

        {/* PRICE + TIME */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ${product.price}
          </span>

          <span className="text-muted-foreground text-sm">
            ⏱ {product.time}
          </span>
        </div>

        {/* QUANTITY */}
        <div className="space-y-2.5">
          <p className="text-xl font-medium">Quantity</p>

          <div className="flex items-center gap-3">
            <button onClick={decreaseQty}>
              <MinusIcon className="cursor-pointer" />
            </button>

            <input
              type="number"
              className="max-w-16 border px-3 py-1 text-center"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
            />

            <button onClick={increaseQty}>
              <PlusIcon className="cursor-pointer" />
            </button>
          </div>
        </div>

        {/* ADD TO CART */}
        <Button
          className="w-full font-medium rounded-none py-3"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="size-5 text-white" />
          Add to cart
        </Button>
      </div>
    </div>
  );
}
