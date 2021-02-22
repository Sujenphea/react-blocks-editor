import React, { useEffect, useRef, useState } from "react";
import { CharacterMetadata } from "./CharacterMetadata";
import { BOLD, NONE } from "./InlineStyles";
// import { SelectionObject } from "./SelectionObject";

const BlockEditor = () => {
  const [block, setBlock] = useState<JSX.Element>();
  const [text, setText] = useState("HelloWorld");
  const [styles, setStyles] = useState<CharacterMetadata[]>([
    { style: BOLD },
    { style: BOLD },
    { style: NONE },
    { style: BOLD },
    { style: NONE },
    { style: NONE },
    { style: BOLD },
    { style: NONE },
    { style: NONE },
    { style: NONE },
  ]);

  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let content: JSX.Element[] = [];

    const styleList = styles!.map((c) => {
      return c.style;
    });

    findRangesImmutable(
      styleList,
      (a: any, b: any) => a === b,
      () => true,
      (start: number, end: number) => {
        if (styleList[start] === BOLD) {
          content.push(
            <span style={{ fontWeight: 600 }}>{text.slice(start, end)}</span>
          );
        } else {
          content.push(<span>{text.slice(start, end)}</span>);
        }
      }
    );
    // return ;
    setBlock(<div>{content}</div>);
  }, []);

  // useEffect(() => {
  //   console.log(styles);
  // }, [styles]);

  const onInput = (e: React.FormEvent) => {
    const input = e.currentTarget.textContent;
    if (input) {
      setText(input);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey && e.key === "b") {
      console.log("bold");
      e.preventDefault();
    }
  };

  const onSelect = (e: React.SyntheticEvent) => {
    // findSelection();
    if (blockRef === null) {
      return;
    }
  };

  const insertStyle = () => {
    const i = findIndex();

    if (i !== undefined && i > text.length) {
      setStyles((styles) => {
        return styles.concat(styles[styles.length - 1]);
      });
    } else if (i !== undefined && i === 1) {
      setStyles((styles) => {
        return [styles[0]].concat(styles);
      });
    } else if (i !== undefined) {
      setStyles((styles) => {
        return styles
          .slice(0, i - 1)
          .concat(styles[i - 2], styles.slice(i - 1, styles.length));
      });
    }
  };

  const removeStyle = () => {
    const i = findIndex();
    if (i === 0) {
      setStyles((styles) => {
        return styles.slice(i + 1, styles.length);
      });
    } else if (i === text.length) {
      return styles.slice(0, i);
    } else if (i !== undefined) {
      setStyles((styles) => {
        return styles.slice(0, i).concat(styles.slice(i + 1, styles.length));
      });
    }
  };

  const removeStyles = () => {
    setStyles([]);
  };

  return (
    <div
      ref={blockRef}
      contentEditable={true}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onSelect={onSelect}
    >
      {block}
    </div>
  );
};

export default BlockEditor;

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

const findSelection = () => {
  const selection = window.getSelection();

  console.log(selection?.anchorNode);
  console.log(selection?.anchorOffset);
  console.log(selection?.focusNode);
  console.log(selection?.focusOffset);
  // console.log(selection?.)

  const first = selection?.anchorNode?.parentNode;
  const second = selection?.focusNode?.parentNode;
  const parent = selection?.anchorNode?.parentNode?.parentNode;
  const children = parent?.childNodes;

  let count = 0;

  if (first === second) {
    for (let i = 0; i < children!.length; i++) {
      if (children![i].isEqualNode(first as Node)) {
        return (
          selection!.anchorOffset + count,
          Math.abs(selection!.anchorOffset - selection!.focusOffset)
        );
      }
      count += children![i].textContent!.length;
    }
  }

  // for (let i = 0; i < children!.length; i++) {
  //
  // }
};
