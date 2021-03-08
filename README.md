# Blocks Editor

A block with all inline styles formatting that spans one line.

# Tutorial

1. Default

```javascript
<BlockProvider>
  <BlockEditor />
</BlockProvider>
```

2. Custom Inline Style

```javascript
const customInlineStyleMap = {
  bold: { fontWeight: "bold" },
  italic: { color: "#382838" },
  // underline ...
  // code ...
  // strikethrough ...
}

<BlockProvider customInlineStyleMap={customInlineStyleMap}>
  <BlockEditor />
</BlockProvider>
```

3. Custom Block Style

```javascript
const customBlockStyle = {
  color: "#383838",
  backgroundColor: "#ffffff"
}

<BlockProvider customBlockStyle={customBlockStyle}>
  <BlockEditor />
</BlockProvider>
```

4. Custom Key Binding

```javascript
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

<BlockProvider customKeyBindingFn={customKeyBindingFn}>
  <BlockEditor />
</BlockProvider>;
```

# Block Editor

Optional Arguments

- block: preset input text and styles
- onChange: called with every update of the block
- focus: if the block should be focused
