import { createGlobalTheme, globalStyle } from "@vanilla-extract/css";


const theme =  {
    color: {
        blue: "#91A6FF",
        pink: "#FF88DC",
        yellow: "#FAFF7F",
        coral: "#FF5154",
        lightCoral: "#FFEBEB",
        coffee:"#1E1014",
    },
    font: {
        heading: "Lacquer, serif",
        body: "Lacquer, serif",
    }
}

export const vars = createGlobalTheme(":root", theme);

globalStyle(":root", {
    backgroundColor: vars.color.lightCoral,
    fontFamily: vars.font.body,
})

globalStyle("h1", {
    fontFamily: vars.font.heading,
})