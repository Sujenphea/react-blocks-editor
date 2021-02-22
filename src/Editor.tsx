import React, { useState } from "react";
import BlockEditor from "./BlockEditor";

export const Editor = () => {
  const [blocks, setBlocks] = useState([
    { blockID: "1" },
    { blockID: "2" },
    { blockID: "3" },
    { blockID: "4" },
    { blockID: "5" },
  ]);

  const onUpdateBlock = () => {};

  return (
    <>
      {/* {blocks.map((b) => {
        return <BlockEditor block={b} onUpdate={onUpdateBlock} />;
      })} */}
    </>
  );
};

type Block = {
  blockID: string;
};
