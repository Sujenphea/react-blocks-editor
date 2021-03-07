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

export default findRangesImmutable;
