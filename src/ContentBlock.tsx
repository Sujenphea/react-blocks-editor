import { useState } from "react";
import { CharacterMetadata } from "./CharacterMetadata";

export type ContentBlock = {
  key: String;
  text: String;
  characterList: CharacterMetadata[];
  depth: number;
};

export const getLength = (contentBlock: ContentBlock) => {
  return contentBlock.text.length;
};

export const getInlineStyleAt = (
  contentBlock: ContentBlock,
  offset: number
) => {
  const char = contentBlock.characterList[offset];
  return char ? char.style : null;
};
