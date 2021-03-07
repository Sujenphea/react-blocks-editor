import React from "react";
import ReactDOM from "react-dom";
import { BlockProvider } from "./BlockContext";
import { BlockEditor } from "./BlockEditor";

const Index = () => {
  return (
    <div>
      <h1>Hello world</h1>
      <BlockProvider>
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
