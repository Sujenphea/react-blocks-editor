import { CharacterMetadata } from "./CharacterMetadata";

export type Block = {
  blockID: string;
  text: string;
  styles: CharacterMetadata[];
};

export type BlockState =
  | "Style"
  | "Insert"
  | "InsertMul"
  | "DeleteOne"
  | "DeleteMul"
  | "None";

// ":db/id"?: number;
// "block/uid"?: string;
// "block/children"?: Node[];
// "block/open"?: boolean;
// "block/order"?: number;
// "block/string"?: string;
// "create/email"?: string;
// "create/time"?: number;
// "edit/email"?: string;
// "edit/time"?: number;
// "node/title"?: string;
// "log/id"?: number;
// "page/sidebar"?: number;
// parents?: Node[]; // used for ui, not for storing
// childrenIDs?: number[]; // only used in getNode
// parsedString?: JSX.Element;
