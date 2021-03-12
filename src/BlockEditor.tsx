/// https://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element

// html updating content for insertion/deletion
// reactjs.org/docs/react-dom-server.html#rendertostaticmarkup
// https://github.com/facebook/react/issues/1466

import ReactDOMServer from "react-dom/server";
import React, { useEffect, useRef, useState } from "react";
import { useBlockProvider } from "./BlockContext";
import { CharacterMetadata, defaultCharMeta } from "./CharacterMetadata";
import { SelectionRanges } from "./SelectionRanges";
import findRangesImmutable from "./findRangesImmutable";
import { Block } from "./Block";

type BlockState =
  | "Style"
  | "Insert"
  | "InsertMul"
  | "DeleteOne"
  | "DeleteMul"
  | "None";

export type BlockEditorProps = {
  block?: Block;
  focus?: Boolean;
  styles?: React.CSSProperties;
  onChange?: (block: Block) => void;
  onKeyDown?: (
    e: React.KeyboardEvent,
    selection: SelectionRanges
  ) => "handled" | null | void;
  onPaste?: (e: React.ClipboardEvent) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
};

export const BlockEditor = (props: BlockEditorProps) => {
  const [content, setContent] = useState("<div></div>");
  const [block, setBlock] = useState<Block>(new Block("1", "", []));
  const [ranges, setRanges] = useState<SelectionRanges>({
    offset: 0,
    length: 0,
    backwards: null,
  });
  const [backSpace, setBackspace] = useState(false);
  const [focused, setFocused] = useState(false);
  const [blockState, setBlockState] = useState<BlockState>("None");
  const { inlineStyleMap, keyBindingFn, blockStyle } = useBlockProvider();

  useEffect(() => {
    if (runAfterContentSet.current !== null) {
      runAfterContentSet.current();
      runAfterContentSet.current = null;
    }
  }, [content]);

  const runAfterContentSet = useRef<(() => void) | null>(null);

  // updates content
  useEffect(() => {
    updateContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block]);

  // updates internal state
  useEffect(() => {
    if (props.block && props.block !== block) {
      const sLength = props.block.styles.length;
      const bLength = props.block.text.length;

      if (bLength > sLength) {
        let styles = props.block.styles;
        for (let i = 0; i < bLength - sLength; i++) {
          styles = styles.concat(defaultCharMeta);
        }

        setBlock(new Block(props.block.id, props.block.text, styles));
        return;
      }

      if (bLength < sLength) {
        const diff = sLength - bLength;
        const newStyles = props.block.styles.slice(-diff, sLength);

        setBlock(new Block(props.block.id, props.block.text, newStyles));
        return;
      }

      setBlock(props.block);
    } else if (!props.block) {
      setBlock(new Block("1", "", []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.block]);

  // tell props what has changed
  const onUpdateBlock = (
    id: string,
    text: string,
    styles: CharacterMetadata[]
  ) => {
    const newBlock = new Block(id, text, styles);
    if (props.onChange) {
      props.onChange(newBlock);
    }
    setBlock(newBlock);
  };

  const updateContent = () => {
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
            style={{ ...getBlockStyle(start), ...props.styles }}
            id={"h".repeat(dataTokenIndex)}
            className="blockSpans"
          >
            {block.text.slice(start, end)}
          </span>
        );

        dataTokenIndex += 1;
      }
    );

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
        case "InsertMul":
          revertSelectionText(startId, startOffset);
          setBlockState("None");
          break;
        case "Style":
          revertSelectionStyle(startId, endId, startOffset, endOffset);
          setBlockState("None");
          break;
      }

      if (props.focus && !focused) {
        onFocus();
        setFocused(true);
      }
    };

    const newContentStatic = ReactDOMServer.renderToStaticMarkup(
      <div className={"blockDiv"}>{newContent}</div>
    );

    setContent(newContentStatic);
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
        isStrikethrough: block.styles[i].isStrikethrough,
      });
    }
    onUpdateBlock(
      block.id,
      block.text,
      block.styles
        .slice(0, ranges.offset)
        .concat(
          newStyles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        )
    );
  };

  const toggleBold = () => {
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
        isStrikethrough: block.styles[i].isStrikethrough,
      });
    }

    onUpdateBlock(
      block.id,
      block.text,
      block.styles
        .slice(0, ranges.offset)
        .concat(
          newStyles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        )
    );
  };

  const toggleUnderline = () => {
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
        isStrikethrough: block.styles[i].isStrikethrough,
      });
    }

    onUpdateBlock(
      block.id,
      block.text,
      block.styles
        .slice(0, ranges.offset)
        .concat(
          newStyles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        )
    );
  };

  const toggleItalic = () => {
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
        isStrikethrough: block.styles[i].isStrikethrough,
      });
    }

    onUpdateBlock(
      block.id,
      block.text,
      block.styles
        .slice(0, ranges.offset)
        .concat(
          newStyles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        )
    );
  };

  const toggleCode = () => {
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
      if (block.styles[i].isCode === false) {
        onCode(true);
        return;
      }
    }
    onCode(false);
  };

  const onStrikethough = (toAdd: boolean) => {
    console.log("strikethrough");

    let newStyles: CharacterMetadata[] = [];
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
      newStyles.push({
        isBold: block.styles[i].isBold,
        isUnderline: block.styles[i].isUnderline,
        isItalic: block.styles[i].isItalic,
        isCode: block.styles[i].isCode,
        isStrikethrough: toAdd,
      });
    }

    onUpdateBlock(
      block.id,
      block.text,
      block.styles
        .slice(0, ranges.offset)
        .concat(
          newStyles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        )
    );
  };

  const toggleStrikethrough = () => {
    for (let i = ranges.offset; i < ranges.offset + ranges.length; i++) {
      if (block.styles[i].isStrikethrough === false) {
        onStrikethough(true);
        return;
      }
    }
    onStrikethough(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // console.log("keydown");
    if (keyBindingFn) {
      const result = keyBindingFn(e);
      switch (result) {
        case "bold":
          e.preventDefault();
          setBlockState("Style");
          toggleBold();
          return;
        case "underline":
          e.preventDefault();
          setBlockState("Style");
          toggleUnderline();
          return;
        case "italic":
          e.preventDefault();
          setBlockState("Style");
          toggleItalic();
          return;
        case "code":
          e.preventDefault();
          setBlockState("Style");
          toggleCode();
          return;
        case "strikethrough":
          e.preventDefault();
          setBlockState("Style");
          toggleStrikethrough();
          return;
        case "handled":
          e.preventDefault();
          console.log("handled");
          return;
      }
    }

    if (typeof props.onKeyDown !== "undefined") {
      // findSelection();
      // console.log(ranges);
      const x = props.onKeyDown(e, ranges);
      if (x === "handled") {
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
    }

    if (e.key === "Backspace" && block.text.length !== 0) {
      setBackspace(true);
    }
  };

  const onInput = (e: React.FormEvent) => {
    const input = e.currentTarget.textContent;

    if (!input) {
      onUpdateBlock(block.id, "", []);
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
        onUpdateBlock(block.id, input, newStyles);
        return;
      }

      setBlockState("DeleteOne");
      const newStyles = block.styles
        .slice(0, ranges.offset - 1)
        .concat(block.styles.slice(ranges.offset, block.styles.length));

      onUpdateBlock(block.id, input, newStyles);
      return;
    }

    const defaultStyle = {
      isBold: false,
      isUnderline: false,
      isItalic: false,
      isCode: false,
      isStrikethrough: false,
    };

    setBlockState("Insert");
    if (ranges.offset === 0) {
      const newStyles = [defaultStyle].concat(
        block.styles.slice(ranges.offset + ranges.length, block.styles.length)
      );
      onUpdateBlock(block.id, input, newStyles);
      return;
    }

    const newStyles = block.styles
      .slice(0, ranges.offset)
      .concat(
        block.styles[ranges.offset - 1],
        block.styles.slice(ranges.offset + ranges.length, block.styles.length)
      );
    onUpdateBlock(block.id, input, newStyles);
    return;
  };

  const onSelect = () => {
    findSelection();
  };

  const onCopy = (e: React.ClipboardEvent) => {
    console.log("onCopy");
    // fix clipboardData.setData("text/html",...)

    e.preventDefault();
    if (ranges.length === 0) {
      return;
    }

    e.clipboardData.setData(
      "text/plain",
      block.text.slice(ranges.offset, ranges.offset + ranges.length)
    );
    e.clipboardData.setData(
      "block/data",
      JSON.stringify({
        id: "-1",
        text: block.text.slice(ranges.offset, ranges.offset + ranges.length),
        styles: block.styles.slice(
          ranges.offset,
          ranges.offset + ranges.length
        ),
      })
    );
  };

  const onPaste = (e: React.ClipboardEvent) => {
    console.log("onPaste");
    e.preventDefault();

    if (typeof props.onPaste !== "undefined") {
      props.onPaste(e);
    }

    if (
      e.clipboardData.getData("text") === "" &&
      e.clipboardData.getData("block/data") === ""
    ) {
      return;
    }

    if (e.clipboardData.getData("block/data") === "") {
      // not internal
      console.log("not internal");

      pasteExternalData(e);
      return;
    }

    const internal: Block = JSON.parse(e.clipboardData.getData("block/data"));
    if (internal.text === e.clipboardData.getData("text/plain")) {
      setBlockState("InsertMul");

      if (ranges.length === 0) {
        const newText = block.text
          .slice(0, ranges.offset)
          .concat(
            internal.text,
            block.text.slice(ranges.offset, block.text.length)
          );
        const newStyles = block.styles
          .slice(0, ranges.offset)
          .concat(
            internal.styles,
            block.styles.slice(ranges.offset, block.styles.length)
          );

        setRanges((ranges) => {
          return {
            offset: ranges.offset + internal.text.length,
            length: 0,
            backwards: null,
          };
        });
        onUpdateBlock(block.id, newText, newStyles);
        return;
      }

      const newText = block.text
        .slice(0, ranges.offset)
        .concat(
          internal.text,
          block.text.slice(ranges.offset + ranges.length, block.text.length)
        );
      const newStyles = block.styles
        .slice(0, ranges.offset)
        .concat(
          internal.styles,
          block.styles.slice(ranges.offset + ranges.length, block.styles.length)
        );

      onUpdateBlock(block.id, newText, newStyles);
      return;
    }

    console.log("not internal");
    pasteExternalData(e);
  };

  const pasteExternalData = (e: React.ClipboardEvent) => {
    setBlockState("InsertMul");
    const text = e.clipboardData.getData("text");
    const newText = block.text
      .slice(0, ranges.offset)
      .concat(
        text,
        block.text.slice(ranges.offset + ranges.length, block.text.length)
      );

    let emptyStyles: CharacterMetadata[] = [];
    for (let i = 0; i < text.length; i++) {
      emptyStyles.push({
        isBold: false,
        isCode: false,
        isItalic: false,
        isUnderline: false,
        isStrikethrough: false,
      });
    }

    const newStyles = block.styles
      .slice(0, ranges.offset)
      .concat(
        emptyStyles,
        block.styles.slice(ranges.offset + ranges.length, block.styles.length)
      );

    setRanges((ranges) => {
      return {
        offset: ranges.offset + text.length,
        length: 0,
        backwards: null,
      };
    });
    onUpdateBlock(block.id, newText, newStyles);
  };

  const onCut = (e: React.ClipboardEvent) => {
    console.log("onCut");
    // fix clipboardData.setData("text/html",...)

    e.preventDefault();
    if (ranges.length === 0) {
      return;
    }

    e.clipboardData.setData(
      "text/plain",
      block.text.slice(ranges.offset, ranges.offset + ranges.length)
    );
    e.clipboardData.setData(
      "block/data",
      JSON.stringify({
        id: "-1",
        text: block.text.slice(ranges.offset, ranges.offset + ranges.length),
        styles: block.styles.slice(
          ranges.offset,
          ranges.offset + ranges.length
        ),
      })
    );

    setBlockState("DeleteMul");

    const newText = block.text
      .slice(0, ranges.offset)
      .concat(
        block.text.slice(ranges.offset + ranges.length, block.text.length)
      );

    const newStyles = block.styles
      .slice(0, ranges.offset)
      .concat(
        block.styles.slice(ranges.offset + ranges.length, block.styles.length)
      );

    onUpdateBlock(block.id, newText, newStyles);
  };

  const onFocus = () => {
    console.log("onFocus");

    const x = document.getElementsByClassName("blockSpans");
    let range = document.createRange();

    if (x.length === 0) {
      const y = document.getElementsByClassName("blockDiv");
      range.setStart(y[0], 0);
    } else {
      range.setStart(x[x.length - 1], 1);
    }

    const selection = window.getSelection();
    selection!.removeAllRanges();
    selection!.addRange(range);
  };

  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    console.log("onBlur");
    if (typeof props.onBlur !== "undefined") {
      props.onBlur(e);
    }
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
  const findSelection: () => SelectionRanges = () => {
    const selection = window.getSelection();

    // div: no selection basically
    if (selection?.anchorNode?.nodeType === 1) {
      const ranges: SelectionRanges = {
        offset: block.text.length,
        length: 0,
        backwards: null,
      };
      setRanges(ranges);
      return ranges;
    }

    const first = selection?.anchorNode?.parentNode;
    const second = selection?.focusNode?.parentNode;
    const parent = selection?.anchorNode?.parentNode?.parentNode;
    const children = parent?.childNodes;

    let metFirst = false;
    let metSecond = false;
    let offset = 0;
    let length = 0;

    for (let i = 0; i < children!.length; i++) {
      // within same span
      if (children![i].isEqualNode(first as Node)) {
        if (selection!.anchorOffset > selection!.focusOffset) {
          // backwards
          const curO = offset + selection!.focusOffset;
          const curL = selection!.anchorOffset - selection!.focusOffset;
          const ranges = {
            offset: curO,
            length: curL,
            backwards: true,
          };
          setRanges(ranges);
          return ranges;
        } else if (selection!.anchorOffset === selection!.focusOffset) {
          // none
          const curO = offset + selection!.focusOffset;
          const ranges = {
            offset: curO,
            length: 0,
            backwards: null,
          };
          setRanges(ranges);
          return ranges;
        } else {
          // forwards
          const curO = offset + selection!.anchorOffset;
          const curL = selection!.focusOffset - selection!.anchorOffset;
          const ranges: SelectionRanges = {
            offset: curO,
            length: curL,
            backwards: false,
          };
          setRanges(ranges);
          return ranges;
        }
      } else if (metFirst) {
        // forwards
        if (children![i].isEqualNode(second as Node)) {
          const curO = offset + selection!.anchorOffset;
          const curL = length + selection!.focusOffset;

          const ranges = { offset: curO, length: curL, backwards: false };
          setRanges(ranges);
          return ranges;
        }
        length += children![i].textContent!.length;
      } else if (metSecond) {
        // backwards
        if (children![i].isEqualNode(first as Node)) {
          const curO = offset + selection!.focusOffset;
          const curL = length + selection!.anchorOffset;

          const ranges = { offset: curO, length: curL, backwards: true };
          setRanges(ranges);
          return ranges;
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
    return { offset: -1, length: -1, backwards: null };
  };

  const getBlockStyle = (start: number) => {
    let blockStyle: React.CSSProperties = {};

    if (block.styles[start].isBold) {
      blockStyle = { ...blockStyle, ...inlineStyleMap.bold };
    }
    if (block.styles[start].isItalic) {
      blockStyle = { ...blockStyle, ...inlineStyleMap.italic };
    }
    if (block.styles[start].isUnderline) {
      blockStyle = { ...blockStyle, ...inlineStyleMap.underline };
    }
    if (block.styles[start].isCode) {
      blockStyle = { ...blockStyle, ...inlineStyleMap.code };
    }
    if (block.styles[start].isStrikethrough) {
      blockStyle = { ...blockStyle, ...inlineStyleMap.strikethrough };
    }

    return blockStyle;
  };

  return (
    <div
      id={block.id}
      style={{
        ...blockStyle,
        minHeight: "20px",
      }}
      suppressContentEditableWarning
      contentEditable={true}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onSelect={onSelect}
      onCopy={onCopy}
      onPaste={onPaste}
      onCut={onCut}
      onBlur={onBlur}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
