export type FrontFieldKey =
  | "name"
  | "team"
  | "position"
  | "number"
  | "statsLine1"
  | "statsLine2"
  | "description";

export type BackFieldKey = "bio" | "seasonSummary" | "footerNote";

export type FrontFields = Record<FrontFieldKey, string>;
export type BackFields = Record<BackFieldKey, string>;

export type TextOverlay = {
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  fontWeight: number;
  align: "left" | "center" | "right";
  color: string;
  background?: TextBackground;
};

export type TextBackground = {
  color: string;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  paddingX?: number;
  paddingY?: number;
  minGap?: number;
};

export type PhotoFrame = {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
};

export type CardSide<FieldKey extends string> = {
  background: string;
  text: Record<FieldKey, TextOverlay>;
  photoFrame?: PhotoFrame;
};

export type FrontSide = CardSide<FrontFieldKey> & {
  photoFrame: PhotoFrame;
};

export type BackSide = CardSide<BackFieldKey>;

export type Template = {
  id: string;
  name: string;
  front: FrontSide;
  back: BackSide;
};

export type DesignState = {
  templateId: string;
  front: FrontFields;
  back: BackFields;
};
