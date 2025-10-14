/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "node-zklib" {
  export default class ZKLib {
    constructor(ip: string, port: number, timeout?: number, inTime?: number);
    createSocket(): Promise<void>;
    disconnect(): Promise<void>;
    getAttendances(): Promise<{ data: any[] }>;
    getInfo(): Promise<any>;
  }
}
