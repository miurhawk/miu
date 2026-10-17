import { style } from "@vanilla-extract/css";
import { vars } from "../theme.css.ts";

export const liMain = style({
    color: vars.color.coral,
})

export const nav = style({
    backgroundColor: vars.color.coffee,
    boxSizing: "border-box",
    display: "flex",
    gap: 8,
    padding: 8,
})

export const navLink = style({
    color: vars.color.lightCoral,
    textDecoration: "none",
})