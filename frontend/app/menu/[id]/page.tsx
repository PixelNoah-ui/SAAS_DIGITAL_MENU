"use client";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

import { MenuDetailsSkeleton } from "@/components/skeletons/MenuDetailsSkeleton";
import { useGetMenu } from "@/hooks/useGetMenu";

export default function MenuDetailsPage() {
  const params = useParams();

  const id = params.id as string;

  const [quantity, setQuantity] = useState(1);

  const { data, isPending } = useGetMenu(id);

  const product = data?.menuItem;

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      imageUrl: product.image,
      quantity,
    });
  };

  const increaseQty = () => setQuantity((prev) => prev + 1);

  const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));

  if (isPending) {
    return <MenuDetailsSkeleton />;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-0 py-10 flex flex-col md:flex-row gap-10">
      {/* LEFT */}
      <div className="basis-2/5 w-full md:sticky md:top-10">
        <div className="relative w-full h-80 overflow-hidden rounded-xl border">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* RIGHT */}
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

        {/* PRICE */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            <span className="text-black">{product.price}</span> ETB
          </div>

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
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="max-w-16 border px-3 py-1 text-center"
            />

            <button onClick={increaseQty}>
              <PlusIcon className="cursor-pointer" />
            </button>
          </div>
        </div>

        {/* BUTTON */}
        <Button
          onClick={handleAddToCart}
          className="w-full rounded-none py-3 font-medium"
        >
          <ShoppingCart className="size-5 text-white" />
          Add to cart
        </Button>
      </div>
    </div>
  );
}
