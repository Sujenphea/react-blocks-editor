export type SelectionRanges = {
  offset: number;
  length: number;
  rangeStart: Node | null;
  rangeStartOffset: number;
  rangeEnd: Node | null;
  rangeEndOffset: number;
  selection: Selection | null;
};
