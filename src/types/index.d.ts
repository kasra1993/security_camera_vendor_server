export {};

declare global {
  namespace Express {
    interface Req {
      file: any;
    }
  }
}
