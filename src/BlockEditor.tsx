// https://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element

// html updating content for insertion/deletion
// reactjs.org/docs/react-dom-server.html#rendertostaticmarkup
// https://github.com/facebook/react/issues/1466

import ReactDOMServer from "react-dom/server";
import React, { useEffect, useRef, useState } from "react";
import { Block } from "./Block";
import { CharacterMetadata } from "./CharacterMetadata";
import { SelectionRanges } from "./SelectionRanges";

export type BlockEditorProps = {
  block: Block;
  updateBlock: (id: string, text: string, styles: CharacterMetadata[]) => void;
};

const BlockEditor = (props: BlockEditorProps) => {
  const [content, setContent] = useState("<div></div>");
  const [block, setBlock] = useState<Block>({
    blockID: "",
    text: "",
    styles: [],
  });
  const [ranges, setRanges] = useState<SelectionRanges>({
    offset: 0,
    length: 0,
  });

  useEffect(() => {
    if (runAfterContentSet.current !== null) {
      runAfterContentSet.current();
      runAfterContentSet.current = null;
    }
  }, [content]);

  const runAfterContentSet = useRef<(() => void) | null>(null);

  // updates content
  useEffect(() => {
    let newContent: JSX.Element[] = [];
    let dataTokenIndex = 1;
    const styleList = block.styles.map((style) => {
      return JSON.stringify(style);
    });

    let startId = "";
    let endId = "";
    let startOffset = -1;
    let endOffset = -1;
    const rangeEnd = ranges.offset + ranges.length - 1;

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

        if (start <= ranges.offset && end > ranges.offset) {
          startId = "h".repeat(dataTokenIndex);
          startOffset = ranges.offset - start;
        }

        if (start <= rangeEnd && end > rangeEnd) {
          endId = "h".repeat(dataTokenIndex);
          endOffset = rangeEnd - start;
        }

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
          // something wrong with padding
          blockStyle.backgroundColor = "rgba(135, 131, 120, 0.15)";
          blockStyle.color = "#EB5757";
          // blockStyle.borderRadius = "3px";
          // blockStyle.fontSize = "85%";
          // blockStyle.padding = "0.2em 0.4em";
        }

        newContent.push(
          <span
            key={dataTokenIndex}
            style={blockStyle}
            id={"h".repeat(dataTokenIndex)}
          >
            {block.text.slice(start, end)}
          </span>
        );

        dataTokenIndex += 1;
      }
    );

    let newContentStatic = ReactDOMServer.renderToStaticMarkup(
      <div>{newContent}</div>
    );

    setContent(newContentStatic);

    runAfterContentSet.current = () => {
      revertSelection(startId, endId, startOffset, endOffset);
    };
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
  const onBold = (offsetLength: number[], toAdd: boolean) => {
    console.log("bold");

    let newStyles: CharacterMetadata[] = [];
    for (let i = offsetLength[0]; i < offsetLength[0] + offsetLength[1]; i++) {
      newStyles.push({
        isBold: toAdd,
        isUnderline: block.styles[i].isUnderline,
        isItalic: block.styles[i].isItalic,
        isCode: block.styles[i].isCode,
      });
    }
    onUpdateBlock(
      block.blockID,
      block.text,
      block.styles
        .slice(0, offsetLength[0])
        .concat(
          newStyles,
          block.styles.slice(
            offsetLength[0] + offsetLength[1],
            block.styles.length
          )
        )
    );
  };

  const checkOnBold = () => {
    const offsetLength = findSelection()!;

    for (let i = offsetLength[0]; i < offsetLength[0] + offsetLength[1]; i++) {
      if (block.styles[i].isBold === false) {
        onBold(offsetLength, true);
        return;
      }
    }
    onBold(offsetLength, false);
  };

  const onUnderline = (offsetLength: number[], toAdd: boolean) => {
    console.log("underline");

    let newStyles: CharacterMetadata[] = [];
    for (let i = offsetLength[0]; i < offsetLength[0] + offsetLength[1]; i++) {
      newStyles.push({
        isBold: block.styles[i].isBold,
        isUnderline: toAdd,
        isItalic: block.styles[i].isItalic,
        isCode: block.styles[i].isCode,
      });
    }

    onUpdateBlock(
      block.blockID,
      block.text,
      block.styles
        .slice(0, offsetLength[0])
        .concat(
          newStyles,
          block.styles.slice(
            offsetLength[0] + offsetLength[1],
            block.styles.length
          )
        )
    );
  };

  const checkOnUnderline = () => {
    const offsetLength = findSelection()!;
    for (let i = offsetLength[0]; i < offsetLength[0] + offsetLength[1]; i++) {
      if (block.styles[i].isUnderline === false) {
        onUnderline(offsetLength, true);
        return;
      }
    }
    onUnderline(offsetLength, false);
  };

  const onItalic = (offsetLength: number[], toAdd: boolean) => {
    console.log("italic");

    let newStyles: CharacterMetadata[] = [];
    for (let i = offsetLength[0]; i < offsetLength[0] + offsetLength[1]; i++) {
      newStyles.push({
        isBold: block.styles[i].isBold,
        isUnderline: block.styles[i].isUnderline,
        isItalic: toAdd,
        isCode: block.styles[i].isCode,
      });
    }

    onUpdateBlock(
      block.blockID,
      block.text,
      block.styles
        .slice(0, offsetLength[0])
        .concat(
          newStyles,
          block.styles.slice(
            offsetLength[0] + offsetLength[1],
            block.styles.length
          )
        )
    );
  };

  const checkOnItalic = () => {
    const offsetLength = findSelection()!;
    for (let i = offsetLength[0]; i < offsetLength[0] + offsetLength[1]; i++) {
      if (block.styles[i].isItalic === false) {
        onItalic(offsetLength, true);
        return;
      }
    }
    onItalic(offsetLength, false);
  };

  const onCode = (offsetLength: number[], toAdd: boolean) => {
    console.log("code");

    let newStyles: CharacterMetadata[] = [];
    for (let i = offsetLength[0]; i < offsetLength[0] + offsetLength[1]; i++) {
      newStyles.push({
        isBold: block.styles[i].isBold,
        isUnderline: block.styles[i].isUnderline,
        isItalic: block.styles[i].isItalic,
        isCode: toAdd,
      });
    }

    onUpdateBlock(
      block.blockID,
      block.text,
      block.styles
        .slice(0, offsetLength[0])
        .concat(
          newStyles,
          block.styles.slice(
            offsetLength[0] + offsetLength[1],
            block.styles.length
          )
        )
    );
  };

  const checkOnCode = () => {
    const offsetLength = findSelection()!;
    for (let i = offsetLength[0]; i < offsetLength[0] + offsetLength[1]; i++) {
      if (block.styles[i].isCode === false) {
        onCode(offsetLength, true);
        return;
      }
    }
    onCode(offsetLength, false);
  };

  const onInput = (e: React.FormEvent) => {
    const input = e.currentTarget.textContent;
    const offsetLength = findSelection();

    if (input && input!.length > block.text.length) {
      console.log("insert");

      const newStyles = block.styles
        .slice(0, offsetLength[0] - 1)
        .concat(
          block.styles[offsetLength[0] - 2],
          block.styles.slice(offsetLength[0] - 1, block.styles.length)
        );

      onUpdateBlock(block.blockID, input, newStyles);
    } else if (input && input!.length < block.text.length) {
      console.log("delete");

      const newStyles = block.styles
        .slice(0, offsetLength[0])
        .concat(block.styles.slice(offsetLength[0] + 1, block.styles.length));

      onUpdateBlock(block.blockID, input, newStyles);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // BOLD
    if (e.metaKey && e.key === "b") {
      e.preventDefault();
      checkOnBold();
    } else if (e.metaKey && e.key === "u") {
      e.preventDefault();
      checkOnUnderline();
    } else if (e.metaKey && e.key === "i") {
      e.preventDefault();
      checkOnItalic();
    } else if (e.metaKey && e.key === "e") {
      e.preventDefault();
      checkOnCode();
    }
  };

  const revertSelection = (
    startId: string,
    endId: string,
    startOffset: number,
    endOffset: number
  ) => {
    if (startOffset === -1 || endOffset === -1) {
      console.log("no selection");
    } else {
      let range = document.createRange();
      const selection = window.getSelection();

      const el = document.getElementById(startId);
      const el2 = document.getElementById(endId);
      range.setStart(el!.childNodes[0], startOffset);
      range.setEnd(el2!.childNodes[0], endOffset + 1);
      selection!.removeAllRanges();
      selection!.addRange(range);
    }
  };

  // find selection range
  const findSelection: () => number[] = () => {
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
        // within same span
        if (children![i].isEqualNode(first as Node)) {
          const curO =
            offset + Math.min(selection!.anchorOffset, selection!.focusOffset);
          const curL = Math.abs(
            selection!.anchorOffset - selection!.focusOffset
          );

          setRanges((range) => ({
            ...range,
            offset: curO,
            length: curL,
          }));

          return [curO, curL];
        }
        offset += children![i].textContent!.length;
      } else if (metFirst) {
        // forwards
        if (children![i].isEqualNode(second as Node)) {
          const curO = offset + selection!.anchorOffset;
          const curL = length + selection!.focusOffset;

          setRanges((range) => ({
            ...range,
            offset: curO,
            length: curL,
          }));

          return [curO, curL];
        }
        length += children![i].textContent!.length;
      } else if (metSecond) {
        // backwards
        if (children![i].isEqualNode(first as Node)) {
          const curO = offset + selection!.focusOffset;
          const curL = length + selection!.anchorOffset;
          setRanges((range) => ({
            ...range,
            offset: curO,
            length: curL,
          }));

          return [curO, curL];
        }
        length += children![i].textContent!.length;
      } else if (children![i].isEqualNode(first as Node)) {
        // first node met (first occurence)
        metFirst = true;
        length += Math.abs(
          children![i].textContent!.length - selection!.anchorOffset
        );
      } else if (children![i].isEqualNode(second as Node)) {
        // second node met (first occurence)
        metSecond = true;
        length += Math.abs(
          children![i].textContent!.length - selection!.focusOffset
        );
      } else {
        offset += children![i].textContent!.length;
      }
    }
    return [0, 0];
  };

  return (
    <div
      suppressContentEditableWarning
      contentEditable={true}
      onInput={onInput}
      onKeyDown={onKeyDown}
      dangerouslySetInnerHTML={{ __html: content }}
    />
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
