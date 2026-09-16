import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import useRouteLoader from "./hooks/useRouteLoader";
import Header from "./components/header";
import Navigation from "./components/Navigation";
import Showcase from "./components/showcase";
import Preview from "./pages/Preview";
import "./App.scss";

const App = () => {
  useRouteLoader();

  const { pathname } = useLocation();

  const isLoginPage =
    pathname.includes("/template/") ||
    pathname.includes("/error") ||
    pathname.includes("/success");

  return (
    <div className="app">
      <Header />
      {!isLoginPage && <Navigation />}

      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<Showcase />} />
            <Route path="/search/:query" element={<Showcase />} />
            <Route path="/filter/:filters" element={<Showcase />} />
            <Route path="/template/:id" element={<Preview />} />
          </Routes>
        </div>
      </main>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </div>
  );
};

export default App;
