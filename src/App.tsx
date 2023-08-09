import { Navigate, Route, Routes } from "react-router-dom";
import { Protector } from "@components/Protector/Index";
import { LoginPage } from "@pages/Login";
import { MainPage } from "@pages/Main";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Protector />}>
        <Route index element={<MainPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to={"/"} />} />
    </Routes>
  );
};
