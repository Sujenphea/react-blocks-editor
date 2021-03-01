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

const BlockStyleProvider = (props: {
  customStyleMap: BlockStyleMap;
  children: React.ReactNode;
}) => {
  let styleMap = props.customStyleMap;

  if (!props.customStyleMap.bold) {
    styleMap = { ...styleMap, bold: DefaultStyleMap.bold };
  }

  if (!props.customStyleMap.italic) {
    styleMap = { ...styleMap, italic: DefaultStyleMap.italic };
  }

  if (!props.customStyleMap.underline) {
    styleMap = { ...styleMap, underline: DefaultStyleMap.underline };
  }

  if (!props.customStyleMap.code) {
    styleMap = { ...styleMap, code: DefaultStyleMap.code };
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

export { BlockStyleProvider, useBlockStyle };
