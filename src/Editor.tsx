import React, { useState } from "react";
import { Block } from "./Block";
import BlockEditor from "./BlockEditor";
import { CharacterMetadata } from "./CharacterMetadata";
import { BOLD, NONE } from "./InlineStyles";

export const Editor = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      blockID: "1",
      text: "helloWorld",
      styles: [
        { style: BOLD },
        { style: BOLD },
        { style: NONE },
        { style: BOLD },
        { style: NONE },
        { style: NONE },
        { style: BOLD },
        { style: NONE },
        { style: NONE },
        { style: NONE },
      ],
    },
  ]);

  //   const onUpdateBlock = () => {};
  const setStyles = (styles: CharacterMetadata[]) => {
    console.log("setStyles");
  };

  const setText = (text: string) => {
    console.log("setText");
  };

  return (
    <div>
      {blocks.map((block) => {
        return (
          <BlockEditor
            key={block.blockID}
            block={block}
            setText={setText}
            setStyles={setStyles}
          />
        );
      })}
    </div>
  );
};
