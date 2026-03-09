import { Outlet } from "react-router-dom";
import { OrderProvider } from "@/context/OrderContext";
import { AppProvider } from "@/context/AppContext";

export default function App() {
  return (
    <AppProvider>
      <OrderProvider>
        <Outlet />
      </OrderProvider>
    </AppProvider>
  );
}
