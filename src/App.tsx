import React from "react";
import { Block } from "./Block";
import { BlockStyleMap, BlockStyleProvider } from "./BlockStyles";
import { Editor } from "./Editor";

function App() {
  const customeStyleMap: BlockStyleMap = {
    // bold: { fontWeight: 600 },
    // italic: { fontWeight: 800 },
    // underline: { borderBottom: "0.05em solid" },
    // code: { backgroundColor: "#575757" },
  };

  return (
    <div className="App">
      <BlockStyleProvider customStyleMap={customeStyleMap}>
        <h1>Hello world</h1>
        <Editor />
      </BlockStyleProvider>
    </div>
  );
}

export default App;
