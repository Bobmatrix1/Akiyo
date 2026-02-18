
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { AuthProvider } from "./contexts/AuthContext";
  import { CartProvider } from "./contexts/CartContext";
  
  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  );  