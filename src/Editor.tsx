import React, { useState } from "react";
import { Block } from "./Block";
import BlockEditor from "./BlockEditor";
import { CharacterMetadata } from "./CharacterMetadata";

export const Editor = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      blockID: "1",
      text: "HELLOWORLD",
      styles: [
        {
          isBold: true,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },
        {
          isBold: true,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },
        {
          isBold: true,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },

        {
          isBold: false,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },
        {
          isBold: false,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },
        {
          isBold: true,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },

        {
          isBold: false,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },

        {
          isBold: false,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },
        {
          isBold: true,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },
        {
          isBold: false,
          isUnderline: false,
          isItalic: false,
          isCode: false,
          isStrikethrough: false,
        },
      ],
    },
  ]);

  const updateBlock = (
    id: string,
    text: string,
    styles: CharacterMetadata[]
  ) => {
    setBlocks((blocks) => {
      return blocks.map((block) => {
        if (block.blockID === id) {
          return { blockID: id, text: text, styles: styles };
        }
        return block;
      });
    });
  };

  return (
    <div>
      {blocks.map((block) => {
        return (
          <BlockEditor
            key={block.blockID}
            block={block}
            updateBlock={updateBlock}
          />
        );
      })}
    </div>
  );
};
