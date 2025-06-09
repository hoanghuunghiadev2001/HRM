/* eslint-disable @typescript-eslint/no-explicit-any */
// types/next-pwa.d.ts

declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PWAOptions {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: any;
    buildExcludes?: string[];
    [key: string]: any;
  }

  function withPWA(options: PWAOptions): (nextConfig: NextConfig) => NextConfig;

  export = withPWA;
}
