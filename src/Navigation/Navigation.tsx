import { NavLink, useLocation } from "react-router";
import { navigationContainer } from "./navigation.css.ts";

// const menu: {to: To, label: string, rotation: string}[] = [
//     {to: "/", label: "hello", rotation: "30deg"},
//     {to: "https://sendmoregetbeta.com", label: "BETA", rotation: "60deg"},
//     {to: "/", label: "projects", rotation: "90deg"},
// ]
export const Navigation = () => {
    const location = useLocation()
    if (location.pathname == "/") {return undefined}
    return (<NavLink to={"/"} className={navigationContainer} />)
}

// const NavigationItem = (props: {
//     to: To,
//     label: string,
//     rotation: string,
// }) => {
//     return <NavLink style={assignInlineVars({[navigationItemRotation]: props.rotation})} className={navigationItem} to={props.to} >{props.label}</NavLink>
// }