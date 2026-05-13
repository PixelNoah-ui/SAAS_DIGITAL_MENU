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
    if (id) {
      router.push(`/menu/${id}`);
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
      className="cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex gap-4 p-4">
        {/* Image Section */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-md overflow-hidden">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 p-0 space-y-2 flex flex-col justify-between">
          {/* Title and Price */}
          <div>
            <h2 className="text-base md:text-lg font-semibold text-foreground leading-snug">
              {title}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          </div>

          {/* Price, Time, and Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col gap-1">
              <span className="text-base md:text-lg font-bold text-primary">
                {price} ETB
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {time}
              </div>
            </div>

            <Button
              size="icon"
              className="rounded-lg w-9 h-9 md:w-10 md:h-10 shadow-sm"
              onClick={handleAddToCart}
            >
              <Plus size={16} className="md:size-5" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
