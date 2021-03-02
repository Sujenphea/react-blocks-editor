import React from "react";
import { BlockStyleMap, BlockProvider, StyleType } from "./BlockContext";
import { Editor } from "./Editor";

function App() {
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
    }
  };

  return (
    <div className="App">
      <BlockProvider
        customInlineStyleMap={customInlineStyleMap}
        customKeyBindingFn={customKeyBindingFn}
        customBlockStyle={{ color: "burlywood" }}
      >
        {/* <BlockProvider> */}
        <h1>Hello world</h1>
        <Editor />
      </BlockProvider>
    </div>
  );
}

export default App;
