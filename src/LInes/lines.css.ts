import { style } from "@vanilla-extract/css";
import { vars } from "../theme.css.ts";


export const tessellateContainer = style({
    width: `100%`,
    height: `fit-content`,
    // border: `2px solid ${vars.color.coffee}`,
    // borderRadius: `32px`,

    //
    display: "flex",
    flexWrap: "wrap",
    gap: 24,
    alignItems: "stretch",
    // padding: 24,
})



export const tessellateSegmented = style({
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
})
export const tessellateSegment = style({
    flex: "1 1 auto",
    padding: "6px 8px",
    borderRadius: 6,
    border: `1px solid ${vars.color.coffee}`,
    background: vars.color.coffee,
    color: vars.color.coral,
    cursor: "pointer",
    font: "inherit",
})

export const tessellateSegmentActive = style([tessellateSegment, {
    background: vars.color.coral,
    borderColor: vars.color.coral,
    color: vars.color.coffee,
}])

export const tessellateValue = style({
    color: vars.color.coral,
})
export const tessellateLegend = style({
    padding: "0 6px",
    color: vars.color.coffee,
})
export const tessellateField = style({
    display: "flex",
    flexDirection: "column",
    gap: 4
})
export const tessellateFieldLabel = style({
    display: "flex",
    justifyContent: "space-between",
    color: vars.color.coffee
})
export const tessellateSection = style({
    border: `1px solid ${vars.color.coffee}`,
    borderRadius: 10,
    padding: "6px 12px 12px",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
})

export const tessellatePrimary = style({
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${vars.color.coral}`,
    background: vars.color.coral,
    color: vars.color.coffee,
    cursor: "pointer",
    font: "inherit",
})

export const tessellateButton = style({
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${vars.color.coffee}`,
    background: vars.color.coffee,
    color: vars.color.coral,
    cursor: "pointer",
    font: "inherit",
})

export const tessellateButtons = style({
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
})
export const tessellatePanel = style({
    flex: "1 1 300px",
    minWidth: 260,
    display: "flex",
    flexDirection: "column",
    gap: 12,
})
export const tessellateCanvasWrap = style({
    flex: "1 1 600px",
    minWidth: 280,
})