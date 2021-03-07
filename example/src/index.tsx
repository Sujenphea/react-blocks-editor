import React from "react";
import ReactDOM from "react-dom";
import { BlockProvider, BlockStyleMap, StyleType } from "./BlockContext";
import { BlockEditor } from "./BlockEditor";

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

  return (
    <div>
      <h1>Hello world</h1>
      <BlockProvider
        customInlineStyleMap={customInlineStyleMap}
        customKeyBindingFn={customKeyBindingFn}
        customBlockStyle={{ color: "burlywood" }}
      >
        <BlockEditor></BlockEditor>
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
