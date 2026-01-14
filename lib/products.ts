export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export const products: Product[] = [
  {
    id: "signature-pack",
    name: "Signature Single",
    description: "One custom card, front + back, ready for print.",
    price: 19,
    image: "/brand/card-neon.png",
  },
  {
    id: "holiday-pack",
    name: "Holiday Highlight",
    description: "Seasonal themed card with premium finish.",
    price: 24,
    image: "/brand/card-christmas.png",
  },
  {
    id: "team-box",
    name: "Team Display Box",
    description: "Full team set with branded storage box.",
    price: 179,
    image: "/brand/hero-box-top.png",
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
