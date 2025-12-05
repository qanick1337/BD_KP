import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router";

import AuthPage from "./pages/AuthPage/AuthPage.jsx";
import Layout from "./components/Layout/Layout.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import { AuthProvider } from "./AuthProvider.jsx";

import HomePage from "./pages/HomePage/HomePage.jsx";

import "./index.css"
import DashBoard from "./pages/DashBoard/DashBoard.jsx";
import VacanciesPage from "./pages/VacanciesPage/VacanciesPage.jsx";
import UsersPage from "./pages/UsersPage/UsersPage.jsx";
import EditUserPage from "./pages/EditUserPage/EditUserPage.jsx";
import NewUserPage from "./pages/NewUserPage/NewUserPage.jsx";
import CreateVacancy from "./pages/CreateVacancy/CreateVacancy.jsx";
import EditVacancyPage from "./pages/EditVacancyPage/EditVacancyPage.jsx";
import CandidatesPage from "./pages/CandidatesPage/CandidatesPage.jsx";
import CandidatePage from "./pages/CandidatePage/CandidatePage.jsx";
import NewApplicationForm from "./pages/NewApplication/NewApplication.jsx";

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
      },
      {
        path: "/dashboard",
        element: <DashBoard/>
      },
      {
        path: "/vacancies",
        element: <VacanciesPage/>
      },
      {
        path: "/users",
        element: <UsersPage/>
      },
      {
        path: "/users/new",
        element: <NewUserPage/>
      },
      {
        path: "/users/:id",
        element: <EditUserPage/>
      },
      {
        path: "/create_vacancy",
        element: <CreateVacancy/>
      },
      {
        path: "/vacancies/:id",
        element: <EditVacancyPage/>
      },
      {
        path: "/candidates",
        element: <CandidatesPage/>
      },
      {
        path: "/candidates/:id",
        element: <CandidatePage/>
      },
      {
        path: "/application/:candidate_id",
        element: <NewApplicationForm/>
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
