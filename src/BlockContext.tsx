import React from "react";

// style
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

// key binding
export type StyleType =
  | "italic"
  | "bold"
  | "underline"
  | "code"
  | "handled"
  | undefined;

const DefaultKeyBindingFn: (e: React.KeyboardEvent) => StyleType = (
  e: React.KeyboardEvent
) => {
  if (!e.metaKey) {
    return;
  }

  switch (e.key) {
    case "b":
      return "bold";
    case "u":
      return "underline";
    case "i":
      return "italic";
    case "e":
      return "code";
  }
};

const BlockContext = React.createContext<
  | {
      inlineStyleMap: BlockStyleMap;
      keyBindingFn?: (e: React.KeyboardEvent) => StyleType;
      blockStyle?: React.CSSProperties;
    }
  | undefined
>(undefined);

const BlockProvider = (props: {
  customInlineStyleMap?: BlockStyleMap;
  customKeyBindingFn?: (e: React.KeyboardEvent) => StyleType;
  customBlockStyle?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  // style
  let inlineStyleMap = DefaultStyleMap;
  let keyBindingFn = DefaultKeyBindingFn;

  if (typeof props.customInlineStyleMap !== "undefined") {
    inlineStyleMap = { ...inlineStyleMap, ...props.customInlineStyleMap };
  }

  // key binding
  // if custom key binding is provided, default key binding will be omitted
  if (typeof props.customKeyBindingFn !== "undefined") {
    keyBindingFn = props.customKeyBindingFn;
  }

  return (
    <BlockContext.Provider
      value={{
        inlineStyleMap,
        keyBindingFn,
        blockStyle: props.customBlockStyle,
      }}
    >
      {props.children}
    </BlockContext.Provider>
  );
};

const useBlockProvider = () => {
  const context = React.useContext(BlockContext);

  if (context === undefined) {
    throw new Error(
      `useBlockProvider must be used within a BlockStyleProvider`
    );
  }

  return context;
};

export { BlockProvider, useBlockProvider };
