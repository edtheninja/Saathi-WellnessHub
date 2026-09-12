/// <reference types="vite/client" />

declare module "virtual:music-library" {
  const musicLibrary: Array<{
    name: string;
    src: string;
  }>;

  export default musicLibrary;
}