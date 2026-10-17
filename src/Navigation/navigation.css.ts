import { createVar, style } from "@vanilla-extract/css";
import { vars } from "../theme.css.ts";


export const navigationContainer = style({
    position: "fixed",
    top: 0,
    left: 0,
    height: 40,
    width: 40,
    boxSizing: "border-box",
    transform: "translate(-25%, -25%)",
    borderRadius: 20,
    backgroundColor: vars.color.coral,
    transition: "all ease 100ms",
    ":hover": {
        height: 100,
        width: 100,
        top: -30,
        left: -30,
        borderRadius: 500,
        border: `100px solid transparent`,
    }
})

export const navigationItemRotation = createVar()
export const navigationItem = style({
    cursor: "pointer",
    position: "absolute",
    left: `0`,
    width: "fit-content",
    textWrap: "nowrap",
    top: `0`,
    opacity: 0,
    color: vars.color.coffee,
    textDecoration: "none",
    backgroundColor: vars.color.coral,
    borderRadius: `100%`,
    padding: `8px 80px 8px 8px`,
    transition: "all ease 300ms",
    transformOrigin: "left center",
    ":hover":  {
        fontWeight: 700,
        scale: `1.2`,
    },
    selectors: {
        [`${navigationContainer}:hover &`]: {
            opacity: 1,
            transform: `rotate(${navigationItemRotation}) translateX(40px)`,
        }
    },
    vars: {
        [navigationItemRotation]: "45deg",
    },
})