declare module "office-to-pdf" {
  const convert: (buffer: Buffer) => Promise<Buffer>;
  export default convert;
}
