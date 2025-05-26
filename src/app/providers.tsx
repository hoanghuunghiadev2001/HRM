"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { ReactNode, useState } from "react";
import vnVN from "antd/locale/vi_VN";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={vnVN}>{children}</ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
}
