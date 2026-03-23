
import { collection, doc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { products, categories } from "../app/data/mock-data";

const defaultBanners = [
  {
    id: 'banner1',
    title: 'Summer Sale',
    subtitle: 'Up to 50% off on selected items',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
    cta: 'Shop Now',
    active: true,
    order: 0
  },
  {
    id: 'banner2',
    title: 'New Arrivals',
    subtitle: 'Discover the latest trends',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    cta: 'Explore',
    active: true,
    order: 1
  },
  {
    id: 'banner3',
    title: 'Free Shipping',
    subtitle: 'On orders over $50',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800',
    cta: 'Learn More',
    active: true,
    order: 2
  },
];

export const seedDatabase = async () => {
  const batch = writeBatch(db);

  // Seed Banners
  defaultBanners.forEach((banner) => {
      const docRef = doc(collection(db, "banners"), banner.id);
      batch.set(docRef, banner);
  });

  // Seed Store Settings
  const settingsRef = doc(db, "settings", "store");
  batch.set(settingsRef, {
      storeName: 'akiyo',
      storeEmail: 'contact@akiyo.com',
      storePhone: '+234 000 000 0000',
      storeAddress: 'Lagos, Nigeria',
      maintenanceMode: false,
      storeStatus: true,
      emailNotifications: true,
      promoBanner: {
          title: 'Join Our Newsletter',
          subtitle: 'Get 10% off your first order',
          image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1200',
          cta: 'Subscribe Now',
          active: true
      }
  }, { merge: true });

  try {
    await batch.commit();
    console.log("Database seeded successfully");
    alert("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    alert("Error seeding database.");
  }
};
