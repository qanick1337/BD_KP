import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router";

import AuthPage from "./pages/AuthPage/AuthPage.jsx";
import Layout from "./components/Layout/Layout.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import { AuthProvider } from "./AuthProvider.jsx";

import HomePage from "./pages/HomePage/HomePage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,   // замість path: "/"
        element: <HomePage />,
      },
      {
        path: "/register",
        element: <RegisterPage/>
      },
      {
        path: "/login",
        element: <AuthPage/>
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
