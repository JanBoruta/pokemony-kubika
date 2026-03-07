declare module 'libheif-js' {
  export class HeifDecoder {
    decode(data: Buffer | Uint8Array): HeifImage[];
  }

  export interface HeifImage {
    get_width(): number;
    get_height(): number;
    display(
      imageData: { data: Uint8ClampedArray; width: number; height: number },
      callback: (displayData: { data: Uint8ClampedArray }) => void
    ): void;
  }
}
