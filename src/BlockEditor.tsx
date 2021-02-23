import React from "react";
import { Block } from "./Block";
import { CharacterMetadata } from "./CharacterMetadata";
import { BOLD } from "./InlineStyles";

export type BlockEditorProps = {
  block: Block;
  setText: (text: string) => void;
  setStyles: (styles: CharacterMetadata[]) => void;
};

const BlockEditor = (props: BlockEditorProps) => {
  // handlers
  const onInput = (e: React.FormEvent) => {
    const input = e.currentTarget.textContent;
    if (input) {
      props.setText(input);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey && e.key === "b") {
      console.log("bold");
      e.preventDefault();
    }
  };

  const onSelect = (e: React.SyntheticEvent) => {
    console.log("offset, length: " + findSelection());
  };

  // helpers
  const insertStyle = () => {
    const i = findIndex();

    if (i !== undefined && i > props.block.text.length) {
      props.setStyles(
        props.block.styles.concat(
          props.block.styles[props.block.styles.length - 1]
        )
      );
    } else if (i !== undefined && i === 1) {
      props.setStyles([props.block.styles[0]].concat(props.block.styles));
    } else if (i !== undefined) {
      props.setStyles(
        props.block.styles
          .slice(0, i - 1)
          .concat(
            props.block.styles[i - 2],
            props.block.styles.slice(i - 1, props.block.styles.length)
          )
      );
    }
  };

  const removeStyle = () => {
    const i = findIndex();
    if (i === 0) {
      props.setStyles(
        props.block.styles.slice(i + 1, props.block.styles.length)
      );
    } else if (i === props.block.text.length) {
      props.setStyles(props.block.styles.slice(0, i));
    } else if (i !== undefined) {
      props.setStyles(
        props.block.styles
          .slice(0, i)
          .concat(props.block.styles.slice(i + 1, props.block.styles.length))
      );
    }
  };

  const removeStyles = () => {
    props.setStyles([]);
  };

  // Setup with initial text and styles
  const Setup = () => {
    let content: JSX.Element[] = [];
    let dataTokenIndex = 0;

    const styleList = props.block.styles.map((c) => {
      return c.style;
    });

    findRangesImmutable(
      styleList,
      (a: any, b: any) => a === b,
      () => true,
      (start: number, end: number) => {
        if (styleList[start] === BOLD) {
          content.push(
            <span key={dataTokenIndex} style={{ fontWeight: 600 }}>
              {props.block.text.slice(start, end)}
            </span>
          );
        } else {
          content.push(
            <span key={dataTokenIndex}>
              {props.block.text.slice(start, end)}
            </span>
          );
        }
        dataTokenIndex += 1;
      }
    );

    return (
      <div
        contentEditable={true}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onSelect={onSelect}
      >
        {content}
      </div>
    );
  };

  return <Setup />;
};

export default BlockEditor;

// helper to reduce span for setup (for now)
const findRangesImmutable = <T extends object>(
  haystack: T[],
  areEqualFn: (a: T, b: T) => boolean,
  filterFn: (value: T) => boolean,
  foundFn: (start: number, end: number) => void
) => {
  if (!haystack.length) {
    return;
  }

  let cursor: number = 0;

  haystack.reduce((value: T, nextValue, nextIndex) => {
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

// find cursor only
const findIndex = () => {
  const selection = window.getSelection();

  const element = selection?.anchorNode?.parentNode;
  const parent = selection?.anchorNode?.parentNode?.parentNode;
  const children = parent?.childNodes;

  let count = 0;

  for (let i = 0; i < children!.length; i++) {
    if (children![i].isEqualNode(element as Node)) {
      return selection!.anchorOffset + count;
    }
    count += children![i].textContent!.length;
  }
};

// todo: find selection range
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
