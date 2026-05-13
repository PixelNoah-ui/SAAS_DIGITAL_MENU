"use client";

import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRestaurantInfo } from "@/hooks/useRestaurantInfo";

interface HelpDialogProps {
  children: React.ReactNode;
}

// Helper function to format telegram URL
function formatTelegramUrl(identifier: string): string {
  if (!identifier) return "https://t.me/";

  // Remove @ if present
  const cleaned = identifier.replace(/^@/, "");

  // Check if it's a phone number (only digits, possibly with + or -)
  if (/^[\d+\-()]+$/.test(cleaned)) {
    // If it looks like a phone number, ensure it starts with +
    const withPlus = cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    return `https://t.me/${withPlus}`;
  }

  // Otherwise treat as username
  return `https://t.me/${cleaned}`;
}

export function HelpDialog({ children }: HelpDialogProps) {
  const { data } = useRestaurantInfo();
  const restaurant = data?.data?.restaurant;

  const phone = restaurant?.phone || "+251912345678";
  const telegramUsername = restaurant?.telegramUsername || "";
  const telegramUrl = formatTelegramUrl(telegramUsername || phone);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-semibold">
            Need Help?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Contact us if you have any issues with your order.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          {/* Call Button */}
          <a href={`tel:${phone}`}>
            <Button
              className="w-full gap-2 justify-start border border-border bg-background hover:bg-muted text-foreground"
              variant="outline"
            >
              <Phone size={18} className="text-primary" />
              Call: {phone}
            </Button>
          </a>

          {/* Telegram Button */}
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
            <Button
              className="w-full gap-2 justify-start border border-border bg-background hover:bg-muted text-foreground"
              variant="outline"
            >
              <MessageCircle size={18} className="text-primary" />
              Message on Telegram
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
