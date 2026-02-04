import { Product } from '../domain/product.entity';

export const dummyProducts: Partial<Product>[] = [
  {
    name: 'Jonathan Series X | Slate Edition',
    description: 'The perfect companion for your daily adventures. With its sleek design and powerful performance, the Jonathan Series X is ready for anything.',
    price: 4500000,
    stock: 100,
    img_url: 'https://eshop-test-resources.s3.us-east-1.amazonaws.com/jonathan-series-x.png',
  },
  {
    name: 'JG Vision Pro | Urban Connect',
    description: 'Experience the world in a new light with the JG Vision Pro. Its advanced optics and lightweight design make it the perfect companion for your daily adventures.',
    price: 3300000,
    stock: 50,
    img_url: 'https://eshop-test-resources.s3.us-east-1.amazonaws.com/smart-glasses-jg.png',
  },
  {
    name: 'Guerrero | Hydro-Tech DataBand',
    description: 'High-absorbency sweatband meets real-time biometric tracking for elite athletes. Stay dry and monitor your vitals without breaking your stride.',
    price: 1500000,
    stock: 25,
    img_url: 'https://eshop-test-resources.s3.us-east-1.amazonaws.com/guerrero-hydro-tech-band.png',
  },
];
