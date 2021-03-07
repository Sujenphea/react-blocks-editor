import { CharacterMetadata } from "./CharacterMetadata";
import findRangesImmutable from "./findRangesImmutable";

type BlockAttributes = {
  ranges: number[];
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isCode: boolean;
  isStrikethrough: boolean;
};

export class RawBlock {
  id: string;
  text: string;
  styles: CharacterMetadata[];

  constructor(id: string, text: string, styles: CharacterMetadata[]) {
    this.id = id;
    this.text = text;
    this.styles = styles;
  }

  getId() {
    return this.id;
  }

  getText() {
    return this.text;
  }

  getStyles() {
    return this.styles;
  }

  getAttributes() {
    const styleList = this.styles.map((style) => {
      return JSON.stringify(style);
    });
    let attributes: BlockAttributes[] = [];

    findRangesImmutable(
      styleList,
      (a: any, b: any) => a === b,
      () => true,
      (start: number, end: number) => {
        attributes = attributes.concat({
          ...this.styles[start],
          ranges: [start, end - 1],
        });
      }
    );

    return attributes;
  }
}
