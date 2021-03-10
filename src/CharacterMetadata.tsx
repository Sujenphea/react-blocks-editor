export type CharacterMetadata = {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isCode: boolean;
  isStrikethrough: boolean;
};

export const defaultCharMeta: CharacterMetadata = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isCode: false,
  isStrikethrough: false,
};
