export interface Product {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  location: string;
  image: string;
  category: string;
  dateAdded: string;
  discount?: string;
  condition?: string;
}

export const products: Product[] = [
  { id: 1, name: 'Modern Office Chair', price: '₱ 12,000.00', priceNum: 12000, location: 'Amanpulo', image: '/living.png', category: 'chairs', dateAdded: '2024-01-15' },
  { id: 2, name: 'Dining Table Set', price: '₱ 25,000.00', priceNum: 25000, location: 'Amanpulo', image: '/dining.png', category: 'tables', dateAdded: '2024-01-10' },
  { id: 3, name: 'Queen Size Bed Frame', price: '₱ 18,000.00', priceNum: 18000, location: 'Amanpulo', image: '/bedroom.png', category: 'bedroom', dateAdded: '2024-01-20' },
  { id: 4, name: 'Leather Sofa 3-Seater', price: '₱ 35,000.00', priceNum: 35000, location: 'Amanpulo', image: '/living.png', category: 'sofa', dateAdded: '2024-01-12' },
  { id: 5, name: 'Storage Cabinet', price: '₱ 8,000.00', priceNum: 8000, location: 'Amanpulo', image: '/dining.png', category: 'cabinet', dateAdded: '2024-01-18' },
  { id: 6, name: 'Ergonomic Desk Chair', price: '₱ 15,000.00', priceNum: 15000, location: 'Amanpulo', image: '/bedroom.png', category: 'chairs', dateAdded: '2024-01-25' },
  { id: 7, name: 'Coffee Table', price: '₱ 6,500.00', priceNum: 6500, location: 'Amanpulo', image: '/living.png', category: 'tables', dateAdded: '2024-01-08' },
  { id: 8, name: 'Wall Mirror Large', price: '₱ 4,200.00', priceNum: 4200, location: 'Amanpulo', image: '/dining.png', category: 'decor', dateAdded: '2024-01-22' },
  { id: 9, name: 'Nightstand Pair', price: '₱ 9,800.00', priceNum: 9800, location: 'Amanpulo', image: '/bedroom.png', category: 'bedroom', dateAdded: '2024-01-14' },
  { id: 10, name: 'Floor Mirror', price: '₱ 7,500.00', priceNum: 7500, location: 'Amanpulo', image: '/living.png', category: 'mirror', dateAdded: '2024-01-16' },
];

export const saleProducts: Product[] = [
  { id: 11, name: 'Filing Cab on Wheels', price: '₱450', priceNum: 450, discount: '50%', image: '/dining.png', category: 'cabinet', location: 'Amanpulo', dateAdded: '2024-01-15' },
  { id: 12, name: 'Bent Ply Office Chair', price: '₱1,200', priceNum: 1200, image: '/bedroom.png', category: 'chairs', location: 'Amanpulo', dateAdded: '2024-01-16' },
  { id: 13, name: 'Filing Trolley', price: '₱700', priceNum: 700, image: '/living.png', category: 'cabinet', location: 'Amanpulo', dateAdded: '2024-01-17' },
  { id: 14, name: 'Muji Style Low Chair', price: '₱463', priceNum: 463, discount: '50%', image: '/dining.png', category: 'chairs', location: 'Amanpulo', dateAdded: '2024-01-18' },
  { id: 15, name: 'Bjorn Siroma Red T...', price: '₱1,200', priceNum: 1200, image: '/bedroom.png', category: 'tables', location: 'Amanpulo', dateAdded: '2024-01-19' }
];

export const newProducts: Product[] = [
  { id: 16, name: 'Folding Trolley', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/living.png', category: 'cabinet', dateAdded: '2024-01-20' },
  { id: 17, name: 'Folding Trolley', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/dining.png', category: 'cabinet', dateAdded: '2024-01-21' },
  { id: 18, name: 'Folding Trolley', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/bedroom.png', category: 'cabinet', dateAdded: '2024-01-22' },
  { id: 19, name: 'Folding Trolley', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/living.png', category: 'cabinet', dateAdded: '2024-01-23' },
  { id: 20, name: 'Folding Trolley', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/dining.png', category: 'cabinet', dateAdded: '2024-01-24' }
];

export const justForYouProducts: Product[] = [
  { id: 21, name: 'Filing Cab on Wheels', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/living.png', category: 'cabinet', dateAdded: '2024-01-25' },
  { id: 22, name: 'Bent Ply Office Chair', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/dining.png', category: 'chairs', dateAdded: '2024-01-26' },
  { id: 23, name: 'Muji Style Low Chair', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/bedroom.png', category: 'chairs', dateAdded: '2024-01-27' },
  { id: 24, name: 'Ex Layered Oak Dra...', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/living.png', category: 'cabinet', dateAdded: '2024-01-28' },
  { id: 25, name: 'Bjorn Siroma Red T...', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/dining.png', category: 'tables', dateAdded: '2024-01-29' },
  { id: 26, name: 'Scandi Wooden St...', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/bedroom.png', category: 'chairs', dateAdded: '2024-01-30' },
  { id: 27, name: 'Folding Trolley', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/living.png', category: 'cabinet', dateAdded: '2024-01-31' },
  { id: 28, name: 'JPN Low Long Bac...', price: '₱12,000', priceNum: 12000, location: 'Amanpulo', image: '/dining.png', category: 'chairs', dateAdded: '2024-02-01' }
];

export const forSwapProducts: Product[] = [
  { id: 29, name: 'Wood and Glass Spice Dyn...', price: '', priceNum: 0, condition: 'Used but okay', location: 'Basadang', image: '/bedroom.png', category: 'decor', dateAdded: '2024-02-02' },
  { id: 30, name: 'Kung ano man (3 st)', price: '', priceNum: 0, condition: 'Used but okay', location: 'Bond Street', image: '/living.png', category: 'chairs', dateAdded: '2024-02-03' },
  { id: 31, name: 'Kung ano man (3 st)', price: '', priceNum: 0, condition: 'Used but okay', location: 'Bond Street', image: '/dining.png', category: 'tables', dateAdded: '2024-02-04' }
];
