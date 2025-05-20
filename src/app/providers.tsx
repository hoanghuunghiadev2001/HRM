"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { ReactNode, useState } from "react";
import vnVN from "antd/locale/vi_VN";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={vnVN}>{children}</ConfigProvider>
    </QueryClientProvider>
  );
}
