import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";

import { Header } from "./layouts/Header";
import Home from "./pages/Home";
import {About} from "./pages/About";
import { MyComponent } from "./pages/Suspense";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Header />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/tasks/create" element={<About />} />
          <Route path="/tasks/:id" element={<About />} />
          <Route path="/suspense" element={<MyComponent />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App