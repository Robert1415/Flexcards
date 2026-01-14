import { BackFieldKey, FrontFieldKey, Template, TextOverlay } from "@/lib/types";

export const frontFieldOrder: FrontFieldKey[] = [
  "position",
  "number",
  "name",
  "team",
  "statsLine1",
  "statsLine2",
  "description",
];

export const backFieldOrder: BackFieldKey[] = [
  "bio",
  "seasonSummary",
  "footerNote",
];

const brandRed = "#E63946";
const brandWhite = "#F8FCFB";
const slateGray = "#B9C6C0";

const styleOneBackText: Record<BackFieldKey, TextOverlay> = {
  bio: {
    x: 8,
    y: 72,
    maxWidth: 84,
    fontSize: 2.6,
    fontWeight: 500,
    align: "center",
    color: brandWhite,
  },
  seasonSummary: {
    x: 8,
    y: 64,
    maxWidth: 84,
    fontSize: 3.2,
    fontWeight: 700,
    align: "center",
    color: brandWhite,
  },
  footerNote: {
    x: 8,
    y: 90,
    maxWidth: 84,
    fontSize: 2.3,
    fontWeight: 600,
    align: "center",
    color: brandWhite,
  },
};

const styleTwoBackText: Record<BackFieldKey, TextOverlay> = {
  bio: {
    x: 8,
    y: 72,
    maxWidth: 84,
    fontSize: 2.6,
    fontWeight: 500,
    align: "center",
    color: brandWhite,
  },
  seasonSummary: {
    x: 8,
    y: 64,
    maxWidth: 84,
    fontSize: 3.2,
    fontWeight: 700,
    align: "center",
    color: brandWhite,
  },
  footerNote: {
    x: 8,
    y: 90,
    maxWidth: 84,
    fontSize: 2.3,
    fontWeight: 600,
    align: "center",
    color: brandWhite,
  },
};

// Positions are in percentages relative to the card. Font sizes use cqi units.
export const templates: Template[] = [
  {
    id: "style-1",
    name: "Style 1",
    front: {
      background: "/templates/style-1-front.png",
      photoFrame: { x: 9.4, y: 9.8, w: 83.7, h: 71.8, radius: 10 },
      text: {
        name: {
          x: 8,
          y: 71,
          maxWidth: 84,
          fontSize: 6.6,
          fontWeight: 700,
          align: "center",
          color: brandWhite,
        },
        team: {
          x: 8,
          y: 80,
          maxWidth: 70,
          fontSize: 3.6,
          fontWeight: 600,
          align: "center",
          color: brandWhite,
        },
        position: {
          x: 8,
          y: 6.5,
          maxWidth: 40,
          fontSize: 3.3,
          fontWeight: 700,
          align: "left",
          color: brandWhite,
        },
        number: {
          x: 78,
          y: 4.8,
          maxWidth: 14,
          fontSize: 7,
          fontWeight: 800,
          align: "right",
          color: brandRed,
        },
        statsLine1: {
          x: 8,
          y: 86,
          maxWidth: 84,
          fontSize: 3,
          fontWeight: 600,
          align: "center",
          color: brandWhite,
        },
        statsLine2: {
          x: 8,
          y: 90,
          maxWidth: 84,
          fontSize: 3,
          fontWeight: 600,
          align: "center",
          color: slateGray,
        },
        description: {
          x: 8,
          y: 93.5,
          maxWidth: 84,
          fontSize: 2.5,
          fontWeight: 500,
          align: "center",
          color: slateGray,
        },
      },
    },
    back: {
      background: "/templates/style-1-back.png",
      photoFrame: { x: 9.3, y: 9.9, w: 83.6, h: 48.1, radius: 10 },
      text: styleOneBackText,
    },
  },
  {
    id: "style-2",
    name: "Style 2",
    front: {
      background: "/templates/style-2-front.png",
      photoFrame: { x: 9.6, y: 10.3, w: 83.4, h: 47.9, radius: 10 },
      text: {
        name: {
          x: 8,
          y: 71,
          maxWidth: 84,
          fontSize: 6.6,
          fontWeight: 700,
          align: "center",
          color: brandWhite,
        },
        team: {
          x: 8,
          y: 80,
          maxWidth: 70,
          fontSize: 3.6,
          fontWeight: 600,
          align: "center",
          color: brandWhite,
        },
        position: {
          x: 8,
          y: 6.5,
          maxWidth: 40,
          fontSize: 3.3,
          fontWeight: 700,
          align: "left",
          color: brandWhite,
        },
        number: {
          x: 78,
          y: 4.8,
          maxWidth: 14,
          fontSize: 7,
          fontWeight: 800,
          align: "right",
          color: brandRed,
        },
        statsLine1: {
          x: 8,
          y: 86,
          maxWidth: 84,
          fontSize: 3,
          fontWeight: 600,
          align: "center",
          color: brandWhite,
        },
        statsLine2: {
          x: 8,
          y: 90,
          maxWidth: 84,
          fontSize: 3,
          fontWeight: 600,
          align: "center",
          color: slateGray,
        },
        description: {
          x: 8,
          y: 93.5,
          maxWidth: 84,
          fontSize: 2.5,
          fontWeight: 500,
          align: "center",
          color: slateGray,
        },
      },
    },
    back: {
      background: "/templates/style-2-back.png",
      photoFrame: { x: 9.5, y: 10.2, w: 83.3, h: 48.0, radius: 10 },
      text: styleTwoBackText,
    },
  },
];
