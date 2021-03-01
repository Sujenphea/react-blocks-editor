import React from "react";

// bold => fontWeight: 600
// italic => fontStyle: "italic"
// underline => borderBottom: "0.05em solid"
// code => backgroundColor: "rgba(135, 131, 120, 0.15)", color: "#EB5757", borderRadius: "3px", fontSize: "85%", padding: "0.2em 0.4em",

export type BlockStyleMap = {
  bold?: React.CSSProperties;
  italic?: React.CSSProperties;
  underline?: React.CSSProperties;
  code?: React.CSSProperties;
};

const DefaultStyleMap: BlockStyleMap = {
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  underline: { borderBottom: "0.05em solid" },
  code: { backgroundColor: "rgba(135, 131, 120, 0.15)", color: "#EB5757" },
};

const BlockStyleContext = React.createContext<
  | {
      styleMap: BlockStyleMap;
    }
  | undefined
>(undefined);

const BlockProvider = (props: {
  customStyleMap?: BlockStyleMap;
  keyBindingFn?: (e: React.KeyboardEvent) => void;
  children: React.ReactNode;
}) => {
  let styleMap = DefaultStyleMap;

  if (typeof props.customStyleMap !== "undefined") {
    styleMap = { ...styleMap, ...props.customStyleMap };
  }

  return (
    <BlockStyleContext.Provider value={{ styleMap }}>
      {props.children}
    </BlockStyleContext.Provider>
  );
};

const useBlockStyle = () => {
  const context = React.useContext(BlockStyleContext);

  if (context === undefined) {
    throw new Error(`useBlockStyle must be used within a BlockStyleProvider`);
  }

  return context;
};

export { BlockProvider, useBlockStyle };
