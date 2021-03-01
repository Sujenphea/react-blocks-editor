import React from "react";
import { Block } from "./Block";
import { BlockStyleMap, BlockProvider } from "./BlockContext";
import { Editor } from "./Editor";

function App() {
  const customeStyleMap: BlockStyleMap = {
    // bold: { color: "saddlebrown" },
    italic: { color: "royalblue" },
    underline: { borderBottom: "0.1em dotted red" },
    code: { backgroundColor: "#575757" },
  };

  return (
    <div className="App">
      <BlockProvider customStyleMap={customeStyleMap}>
        {/* <BlockProvider> */}
        <h1>Hello world</h1>
        <Editor />
      </BlockProvider>
    </div>
  );
}

export default App;
