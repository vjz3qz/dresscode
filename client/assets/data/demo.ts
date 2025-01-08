import { ShoppingCard } from "@/types";
import IMAGE_01 from "@/assets/images/01.jpg";
import IMAGE_02 from "@/assets/images/02.jpg";
import IMAGE_03 from "@/assets/images/03.jpg";
import IMAGE_04 from "@/assets/images/04.jpg";
import IMAGE_05 from "@/assets/images/05.jpg";
import IMAGE_06 from "@/assets/images/06.jpg";
import IMAGE_07 from "@/assets/images/07.jpg";
import IMAGE_08 from "@/assets/images/08.jpg";
import IMAGE_09 from "@/assets/images/09.jpg";
import IMAGE_10 from "@/assets/images/10.jpg";

const data: ShoppingCard[] = [
  {
    id: 1,
    name: "Classic White T-Shirt",
    description:
      "A timeless white t-shirt made from 100% organic cotton. Perfect for everyday wear.",
    store: "Uniqlo",
    price: "$19.99",
    image: IMAGE_01,
  },
  {
    id: 2,
    name: "Blue Denim Jacket",
    description:
      "A stylish blue denim jacket with a vintage wash. Ideal for layering in cooler weather.",
    store: "Levi's",
    price: "$89.99",
    image: IMAGE_02,
  },
  {
    id: 3,
    name: "Black Slim Fit Jeans",
    description:
      "Comfortable slim fit jeans made with stretch denim. A wardrobe essential.",
    store: "H&M",
    price: "$39.99",
    image: IMAGE_03,
  },
  // {
  //   id: 4,
  //   name: "Leather Chelsea Boots",
  //   description:
  //     "Elegant leather Chelsea boots with a sleek design. Perfect for both casual and formal occasions.",
  //   store: "Dr. Martens",
  //   price: "$149.99",
  //   image: IMAGE_04,
  // },
  {
    id: 4,
    name: "Blue Floral Summer Dress",
    description:
      "Elegant summer dress with a sleek design. Perfect for both casual and formal occasions.",
    store: "Dr. Martens",
    price: "$149.99",
    image: IMAGE_04,
  },
  {
    id: 5,
    name: "Grey Wool Coat",
    description:
      "A warm and stylish wool coat in a versatile grey shade. Ideal for winter.",
    store: "Zara",
    price: "$199.99",
    image: IMAGE_05,
  },
  {
    id: 6,
    name: "Red Flannel Shirt",
    description:
      "A soft and comfortable flannel shirt in a classic red plaid pattern.",
    store: "Patagonia",
    price: "$69.99",
    image: IMAGE_06,
  },
  {
    id: 7,
    name: "Khaki Chino Pants",
    description:
      "Smart-casual khaki chinos with a tailored fit. Perfect for the office or a night out.",
    store: "Gap",
    price: "$49.99",
    image: IMAGE_07,
  },
  {
    id: 8,
    name: "White Sneakers",
    description:
      "Minimalist white sneakers with a clean design. A must-have for any modern wardrobe.",
    store: "Adidas",
    price: "$89.99",
    image: IMAGE_08,
  },
  {
    id: 9,
    name: "Navy Blue Hoodie",
    description:
      "A cozy navy blue hoodie made from soft cotton. Great for lounging or casual outings.",
    store: "Nike",
    price: "$59.99",
    image: IMAGE_09,
  },
  {
    id: 10,
    name: "Brown Leather Belt",
    description:
      "A durable brown leather belt with a classic buckle. Complements any outfit.",
    store: "Ralph Lauren",
    price: "$39.99",
    image: IMAGE_10,
  },
];

export default data;
