import { NavLink } from "react-router";
import { liMain, nav, navLink } from "./home.css.ts";


export const Home = () => {

    return (<>
            <nav className={nav}>
                <NavLink className={navLink} to={"lines"}>Lines</NavLink>
            </nav>
        <h1>Miura Hawkins</h1>

        <h2>CV</h2>
        <h4>Work</h4>
        <ul>
            <li>CEO / founder <span className={liMain}> Chalk Technologies OÜ - Tallinn, EE: 2020 - now</span></li>
            <li>Owner / founder <span className={liMain}> gebla Ltd. - Mriehel, MT: 2020 - 2025</span></li>
            <li>Head of Development<span className={liMain}> Maverick Technology Ltd. - Sliema, MT: 2018 - 2020</span></li>
            <li>Software Developer<span className={liMain}> Carbon Delta Ag. - Zürich, CH: 2015 - 2018</span></li>
        </ul>
        <h4>Education</h4>
        <ul>
            <li>BA Cognitive Science, Mathematics, French Culture<span className={liMain}> The Johns Hopkins University - Baltimore, Maryland, USA: 2013</span></li>
            <li>MSc Neural Systems and Computation<span className={liMain}> Institut für Neuroinformatik / Eidgenössische Technische Hochschule Zürich - Zürich, CH: 2015</span></li>
        </ul>
        <h4>Tongues</h4>
        <ul>
            <li>English<span className={liMain}> keeps getting worse</span></li>
            <li>Français<span className={liMain}> courrament</span></li>
            <li>Deutsch<span className={liMain}> gut genug</span></li>
            <li>Malti<span className={liMain}> hazin</span></li>
            <li>Español<span className={liMain}> un poco</span></li>
        </ul>
    </>
)
}