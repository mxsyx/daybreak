/// <reference types="vite/client" />

interface TextGrid {
  type: "grid";
  start: number;
  end: number;
  text: string;
  scene?: string;
}

interface Scene {
  type: "scene";
  text: string;
  grids: TextGrid[];
  layout: Layout;
}

interface Size {
  width: number;
  height: number;
  ratio: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dict<T = any> = Record<string, T>;

type ReactFC<T = unknown> = React.FC<T & { children: React.ReactNode }>;

interface Window {
  encodeWebp: (data: ImageData) => Promise<ArrayBuffer>;
}

interface Layout {
  type: "layout";
  rows: number;
  cols: number;
  blocks: Block[];
}

interface Block {
  type: "block";
  pl: number;
  pr: number;
  pt: number;
  pb: number;
  object?: SceneObject;
}

interface Image {
  type: "image";
  src: string;
}

type SceneObject = Layout | Block | Image;

type Asset = Layout;
