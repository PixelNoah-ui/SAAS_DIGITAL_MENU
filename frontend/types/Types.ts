export type sortType = "last_updated" | "price_asc" | "price_desc";
export type ProductType = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  imageUrl?: string;
  time: string;

  category: string;
};
