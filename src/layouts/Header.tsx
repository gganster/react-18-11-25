import {useState} from "react";
import { Outlet } from "react-router-dom";

export const Header = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <p onClick={() => setCount(count + 1)}>Count: {count}</p>
      </div>
      <Outlet />
    </>
  )
}
