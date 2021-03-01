/// https://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element

// html updating content for insertion/deletion
// reactjs.org/docs/react-dom-server.html#rendertostaticmarkup
// https://github.com/facebook/react/issues/1466

import ReactDOMServer from "react-dom/server";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Block, BlockState } from "./Block";
import { CharacterMetadata } from "./CharacterMetadata";
import { SelectionRanges } from "./SelectionRanges";
import { useBlockStyle } from "./BlockStyles";

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
  const [backSpace, setBackspace] = useState(false);
  const [blockState, setBlockState] = useState<BlockState>("None");
  const styleMap = useBlockStyle();

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
        if (start <= ranges.offset && end >= ranges.offset) {
          startId = "h".repeat(dataTokenIndex);
          startOffset = ranges.offset - start;
        }

        if (start <= rangeEnd && end >= rangeEnd) {
          endId = "h".repeat(dataTokenIndex);
          endOffset = rangeEnd - start;
        }

        newContent.push(
          <span
            key={dataTokenIndex}
            style={getBlockStyle(start, end)}
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

    // modify caret/selection position
    runAfterContentSet.current = () => {
      switch (blockState) {
        case "DeleteMul":
          revertSelectionText(startId, startOffset);
          setBlockState("None");
          break;
        case "DeleteOne":
          revertSelectionText(endId, endOffset);
          setBlockState("None");
          break;
        case "Insert":
          revertSelectionText(startId, startOffset + 1);
          setBlockState("None");
          break;
        case "Style":
          revertSelectionStyle(startId, endId, startOffset, endOffset);
          setBlockState("None");
          break;
      }
    };
  }, [block]);

  // updates internal state
  useEffect(() => {
    if (props.block !== block) {
      setBlock(props.block);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const onBold = (toAdd: boolean) => {
    console.log("bold");

    let newStyles: CharacterMetadata[] = [];
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
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
        .slice(0, ranges.offset)
        .concat(
          newStyles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        )
    );
  };

  const checkOnBold = () => {
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
      if (block.styles[i].isBold === false) {
        onBold(true);
        return;
      }
    }
    onBold(false);
  };

  const onUnderline = (toAdd: boolean) => {
    console.log("underline");

    let newStyles: CharacterMetadata[] = [];
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
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
        .slice(0, ranges.offset)
        .concat(
          newStyles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        )
    );
  };

  const checkOnUnderline = () => {
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
      if (block.styles[i].isUnderline === false) {
        onUnderline(true);
        return;
      }
    }
    onUnderline(false);
  };

  const onItalic = (toAdd: boolean) => {
    console.log("italic");

    let newStyles: CharacterMetadata[] = [];
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
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
        .slice(0, ranges.offset)
        .concat(
          newStyles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        )
    );
  };

  const checkOnItalic = () => {
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
      if (block.styles[i].isItalic === false) {
        onItalic(true);
        return;
      }
    }
    onItalic(false);
  };

  const onCode = (toAdd: boolean) => {
    console.log("code");

    let newStyles: CharacterMetadata[] = [];
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
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
        .slice(0, ranges.offset)
        .concat(
          newStyles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        )
    );
  };

  const checkOnCode = () => {
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
      if (block.styles[i].isCode === false) {
        onCode(true);
        return;
      }
    }
    onCode(false);
  };

  const onInput = (e: React.FormEvent) => {
    const input = e.currentTarget.textContent;

    if (!input) {
      onUpdateBlock(block.blockID, "", []);
      setBackspace(false);
      return;
    }

    if (backSpace) {
      console.log("delete");
      setBackspace(!backSpace);

      if (ranges.length > 0) {
        // only batch deletion here
        setBlockState("DeleteMul");
        const newStyles = block.styles
          .slice(0, ranges.offset)
          .concat(
            block.styles.slice(
              ranges.offset + ranges.length,
              block.styles.length
            )
          );
        onUpdateBlock(block.blockID, input, newStyles);
        return;
      }

      setBlockState("DeleteOne");
      const newStyles = block.styles
        .slice(0, ranges.offset - 1)
        .concat(block.styles.slice(ranges.offset, block.styles.length));

      onUpdateBlock(block.blockID, input, newStyles);
      return;
    }

    const defaultStyle = {
      isBold: false,
      isUnderline: false,
      isItalic: false,
      isCode: false,
    };

    setBlockState("Insert");
    if (ranges.offset === 0) {
      const newStyles = [defaultStyle].concat(
        block.styles.slice(ranges.offset + ranges.length, block.styles.length)
      );
      onUpdateBlock(block.blockID, input, newStyles);
      return;
    }

    const newStyles = block.styles
      .slice(0, ranges.offset)
      .concat(
        block.styles[ranges.offset - 1],
        block.styles.slice(ranges.offset + ranges.length, block.styles.length)
      );
    onUpdateBlock(block.blockID, input, newStyles);
    return;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // BOLD
    if (e.metaKey && e.key === "b") {
      e.preventDefault();
      setBlockState("Style");
      checkOnBold();
    } else if (e.metaKey && e.key === "u") {
      e.preventDefault();
      setBlockState("Style");
      checkOnUnderline();
    } else if (e.metaKey && e.key === "i") {
      e.preventDefault();
      setBlockState("Style");
      checkOnItalic();
    } else if (e.metaKey && e.key === "e") {
      e.preventDefault();
      setBlockState("Style");
      checkOnCode();
    } else if (e.key === "Backspace") {
      setBackspace(true);
    }
  };

  const onSelect = (e: React.SyntheticEvent) => {
    findSelection();
  };

  const revertSelectionStyle = (
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

  const revertSelectionText = (id: string, offset: number) => {
    let range = document.createRange();
    const selection = window.getSelection();

    const el = document.getElementById(id);
    if (el) {
      range.setStart(el!.childNodes[0], offset);
      selection!.removeAllRanges();
      selection!.addRange(range);
    }
  };

  // find selection range
  const findSelection: () => void = () => {
    const selection = window.getSelection();

    if (selection?.anchorNode?.nodeType === 1) {
      setRanges({ offset: block.text.length, length: 0 });
      return;
    }

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
  };

  const getBlockStyle = (start: number, end: number) => {
    let blockStyle: React.CSSProperties = {};

    if (block.styles[start].isBold) {
      blockStyle = { ...blockStyle, ...styleMap.styleMap.bold };
    }
    if (block.styles[start].isItalic) {
      blockStyle = { ...blockStyle, ...styleMap.styleMap.italic };
    }
    if (block.styles[start].isUnderline) {
      blockStyle = { ...blockStyle, ...styleMap.styleMap.underline };
    }
    if (block.styles[start].isCode) {
      blockStyle = { ...blockStyle, ...styleMap.styleMap.code };
    }

    return blockStyle;
  };

  return (
    <div
      id={block.blockID}
      style={{ minHeight: "20px" }}
      suppressContentEditableWarning
      contentEditable={true}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onSelect={onSelect}
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
