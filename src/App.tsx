import "./theme.css.ts";
import { Navigation } from "./Navigation/Navigation.tsx";
import { Outlet, Route, BrowserRouter as Router, Routes } from "react-router";
import { Home } from "./Home/Home.tsx";
import { mainContainer } from "./styles.css.ts";
import { Lines } from "./LInes/Lines.tsx";

function App() {

  return (
    <Router basename={"/miu"}>
        <Routes>
            <Route path={"/*"} element={<Base />}>
                <Route index element={<Home />} />
                <Route path={"lines"} element={<Lines />} />
            </Route>
        </Routes>
    </Router>
  )
}

export default App


const Base = () => {

    return (<div className={mainContainer}>
        <Navigation />
        <Outlet />
    </div>)
}