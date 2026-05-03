"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface MenuCardProps {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  price: number;
  image: string;
  time: string;
  isVegetarian?: boolean;
}

export default function MenuCard({ menu }: { menu: MenuCardProps }) {
  const router = useRouter();

  const { id, slug, title, description, price, image, time } = menu;

  const addItem = useCartStore((state) => state.addItem);

  const handleNavigate = () => {
    if (slug) {
      router.push(`/menu/${slug}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // 🔥 prevents redirect
    e.preventDefault();

    addItem({
      id: slug || id || Math.random().toString(36).substr(2, 9),
      name: title,
      price,
      imageUrl: image,
      quantity: 1,
    });
  };

  return (
    <Card
      onClick={handleNavigate}
      className="cursor-pointer overflow-hidden rounded-none border bg-card shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative w-full h-52">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground leading-snug">
            {title}
          </h2>
          <span className="text-base font-semibold text-primary">
            {price} ETB
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {time}
          </div>

          <Button
            size="icon"
            className="rounded-full w-10 h-10 shadow-sm"
            onClick={handleAddToCart}
          >
            <Plus size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}