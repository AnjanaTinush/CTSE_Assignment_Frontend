import { BrowserRouter } from "react-router-dom";
import AppRouter from "./app/router/AppRouter";

import { AuthProvider } from "./features/auth/authSlice";
import { ProductProvider } from "./features/products/productSlice";
import { OrderProvider } from "./features/orders/orderSlice";

export default function App() {

  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>

          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>

        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}