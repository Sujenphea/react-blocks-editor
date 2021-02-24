import React, { useEffect, useRef, useState } from "react";
import { Block } from "./Block";
import { CharacterMetadata } from "./CharacterMetadata";

export type BlockEditorProps = {
  block: Block;
  updateBlock: (id: string, text: string, styles: CharacterMetadata[]) => void;
};

const BlockEditor = (props: BlockEditorProps) => {
  const [content, setContent] = useState(<div></div>);

  const [block, setBlock] = useState<Block>({
    blockID: "",
    text: "",
    styles: [],
  });

  const mainRef = useRef<HTMLDivElement>(null);

  // updates content
  useEffect(() => {
    console.log(block.styles);
    let newContent: JSX.Element[] = [];
    let dataTokenIndex = 0;
    const styleList = block.styles.map((style) => {
      return JSON.stringify(style);
    });

    findRangesImmutable(
      styleList,
      (a: any, b: any) => a === b,
      () => true,
      (start: number, end: number) => {
        let blockStyle = {
          fontWeight: 400,
          fontStyle: "normal",
          borderBottom: "none",
          backgroundColor: "transparent",
          color: "currentColor",
          borderRadius: "initial",
          fontSize: "initial",
          padding: "0",
        };

        if (block.styles[start].isBold) {
          blockStyle.fontWeight = 600;
        }
        if (block.styles[start].isItalic) {
          blockStyle.fontStyle = "italic";
        }
        if (block.styles[start].isUnderline) {
          blockStyle.borderBottom = "0.05em solid";
        }
        if (block.styles[start].isCode) {
          blockStyle.backgroundColor = "rgba(135, 131, 120, 0.15)";
          blockStyle.color = "#EB5757";
          blockStyle.borderRadius = "3px";
          blockStyle.fontSize = "85%";
          blockStyle.padding = "0.2em 0.4em";
        }

        newContent.push(
          <span key={dataTokenIndex} style={blockStyle}>
            {block.text.slice(start, end)}
          </span>
        );

        dataTokenIndex += 1;
      }
    );
    setContent(<div>{newContent}</div>);
  }, [block]);

  // updates internal state
  useEffect(() => {
    if (props.block !== block) {
      setBlock(props.block);
    }
  }, [props.block]);

  // tell props what has changed
  const onUpdateBlock = (
    id: string,
    text: string,
    styles: CharacterMetadata[]
  ) => {
    props.updateBlock(id, text, styles);
    setBlock(block);
  };

  // handlers
  const onBold = () => {
    console.log("bold");
    const ranges = findSelection()!;
    let newStyles: CharacterMetadata[] = [];

    for (let i = ranges[0]; i < ranges[0] + ranges[1]; i++) {
      newStyles.push({
        isBold: true,
        isUnderline: block.styles[i].isUnderline,
        isItalic: block.styles[i].isItalic,
        isCode: block.styles[i].isCode,
      });
    }

    onUpdateBlock(
      block.blockID,
      block.text,
      block.styles
        .slice(0, ranges[0])
        .concat(
          newStyles,
          block.styles.slice(ranges[0] + ranges[1] + 1, block.styles.length)
        )
    );
  };

  const onInput = (e: React.FormEvent) => {
    const input = e.currentTarget.textContent;
    if (input) {
      onUpdateBlock(block.blockID, input, block.styles);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // BOLD
    if (e.metaKey && e.key === "b") {
      e.preventDefault();
      onBold();
    }
  };

  const onSelect = (e: React.SyntheticEvent) => {
    console.log("offset, length: " + findSelection());
  };

  // const insertStyle = () => {
  //   const i = findSelection()![0];

  //   if (i !== undefined && i > props.block.text.length) {
  //     return props.block.styles.concat(
  //       props.block.styles[props.block.styles.length - 1]
  //     );
  //   } else if (i !== undefined && i === 1) {
  //     return [props.block.styles[0]].concat(props.block.styles);
  //   } else if (i !== undefined) {
  //     return props.block.styles
  //       .slice(0, i - 1)
  //       .concat(
  //         props.block.styles[i - 2],
  //         props.block.styles.slice(i - 1, props.block.styles.length)
  //       );
  //   }
  //   return props.block.styles;
  // };

  return (
    <div
      suppressContentEditableWarning
      contentEditable={true}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onSelect={onSelect}
      ref={mainRef}
    >
      {content}
    </div>
  );
};

export default BlockEditor;

// helper to reduce span for setup (for now)
const findRangesImmutable = (
  haystack: string[],
  areEqualFn: (a: string, b: string) => boolean,
  filterFn: (value: string) => boolean,
  foundFn: (start: number, end: number) => void
) => {
  if (!haystack.length) {
    return;
  }

  let cursor: number = 0;

  haystack.reduce((value: string, nextValue, nextIndex) => {
    if (!areEqualFn(value, nextValue)) {
      if (filterFn(value)) {
        foundFn(cursor, nextIndex);
      }
      cursor = nextIndex;
    }
    return nextValue;
  });

  if (filterFn(haystack[haystack.length - 1])) {
    foundFn(cursor, haystack.length);
  }
};

// find selection range
const findSelection = () => {
  const selection = window.getSelection();

  const first = selection?.anchorNode?.parentNode;
  const second = selection?.focusNode?.parentNode;
  const parent = selection?.anchorNode?.parentNode?.parentNode;
  const children = parent?.childNodes;

  let metFirst = false;
  let metSecond = false;
  const same = first === second;
  let offset = 0;
  let length = 0;

  for (let i = 0; i < children!.length; i++) {
    if (same) {
      if (children![i].isEqualNode(first as Node)) {
        return [
          offset + Math.min(selection!.anchorOffset, selection!.focusOffset),
          Math.abs(selection!.anchorOffset - selection!.focusOffset),
        ];
      }
      offset += children![i].textContent!.length;
    } else if (metFirst) {
      if (children![i].isEqualNode(second as Node)) {
        return [
          offset + selection!.anchorOffset,
          length + selection!.focusOffset,
        ];
      }
      length += children![i].textContent!.length;
    } else if (metSecond) {
      if (children![i].isEqualNode(first as Node)) {
        return [
          offset + selection!.focusOffset,
          length + selection!.anchorOffset,
        ];
      }
      length += children![i].textContent!.length;
    } else if (children![i].isEqualNode(first as Node)) {
      metFirst = true;
      length += Math.abs(
        children![i].textContent!.length - selection!.anchorOffset
      );
    } else if (children![i].isEqualNode(second as Node)) {
      metSecond = true;
      length += Math.abs(
        children![i].textContent!.length - selection!.focusOffset
      );
    } else {
      offset += children![i].textContent!.length;
    }
  }
};
