import React from "react";
import ReactDOM from "react-dom";
import { BlockProvider, BlockStyleMap, StyleType } from "./BlockContext";
import { BlockEditor } from "./BlockEditor";
import { Block } from "./Block";
import { CharacterMetadata, defaultCharMeta } from "./CharacterMetadata";
import { SelectionRanges } from "./SelectionRanges";

const Index = () => {
  const customInlineStyleMap: BlockStyleMap = {
    // bold: { color: "saddlebrown" },
    italic: { color: "royalblue" },
    underline: { borderBottom: "0.1em dotted red" },
    code: { backgroundColor: "#575757" },
  };

  const customKeyBindingFn: (e: React.KeyboardEvent) => StyleType = (
    e: React.KeyboardEvent
  ) => {
    if (!e.metaKey) {
      return;
    }

    switch (e.key) {
      case "a":
        return "bold";
      case "s":
        return "underline";
      case "d":
        return "italic";
      case "f":
        return "code";
      case "e":
        return "strikethrough";
    }
  };

  const onChange = (block: Block) => {
    // console.log(block.getAttributes());
  };

  const onKeyDown = (e: React.KeyboardEvent, selection: SelectionRanges) => {
    return;
  };

  return (
    <div>
      <h1>Hello world</h1>
      <BlockProvider
        customInlineStyleMap={customInlineStyleMap}
        customKeyBindingFn={customKeyBindingFn}
        customBlockStyle={{ color: "burlywood" }}
      >
        <BlockEditor
          block={
            new Block("block1", "hello world", [
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: false,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: false,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: true,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: true,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: true,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: true,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: true,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: true,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: false,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: false,
              },
              {
                isBold: false,
                isCode: false,
                isItalic: false,
                isStrikethrough: false,
                isUnderline: false,
              },
            ])
          }
          onChange={onChange}
          onKeyDown={onKeyDown}
        ></BlockEditor>
      </BlockProvider>
    </div>
  );
};

export default Index;

ReactDOM.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
  document.getElementById("root")
);
