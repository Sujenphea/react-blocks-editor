import React, { useState } from "react";

export type CharacterMetadata = {
  style: string[];
};

export const hasStyle = (metadata: CharacterMetadata, style: string) => {
  return metadata.style.includes(style);
};
