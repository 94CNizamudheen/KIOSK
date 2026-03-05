import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Welcome from "./pages/Welcome";
import OrderType from "./pages/OrderType";
import Menu from "./pages/Menu";
import Payment from "./pages/Payment";
import OrderConfirmed from "./pages/OrderConfirmed";
import PosSettings from "./pages/PosSettings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Welcome /> },
      { path: "order-type", element: <OrderType /> },
      { path: "menu", element: <Menu /> },
      { path: "resume/:orderNumber", element: <Menu /> },
      { path: "payment", element: <Payment /> },
      { path: "confirmed", element: <OrderConfirmed /> },
      { path: "settings", element: <PosSettings /> },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
