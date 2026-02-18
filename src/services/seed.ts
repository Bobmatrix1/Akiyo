
import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { products, categories } from "../app/data/mock-data";

export const seedDatabase = async () => {
  const batch = writeBatch(db);

  // Seed Products
  products.forEach((product) => {
    const docRef = doc(collection(db, "products"), product.id); 
    // We use the existing ID from mock-data to keep consistency if run multiple times, 
    // though usually new IDs are generated. 
    // However, mock-data IDs are nice strings, Firestore auto-IDs are random.
    // Let's rely on Firestore auto-IDs for new products but for seeding let's try to keep it simple.
    // Actually, setDoc with custom ID is fine.
    batch.set(docRef, { ...product, createdAt: new Date() });
  });

  // Seed Categories (optional, if we want to store them in DB)
  categories.forEach((category) => {
      const docRef = doc(collection(db, "categories"), category.id);
      batch.set(docRef, category);
  });

  try {
    await batch.commit();
    console.log("Database seeded successfully");
    alert("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    alert("Error seeding database.");
  }
};
