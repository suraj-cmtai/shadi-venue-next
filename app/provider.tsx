"use client";

import { Provider as ReduxProvider } from "react-redux";
import store from "@/lib/redux/store";

export default function ReduxStoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      {children}
    </ReduxProvider>
  );
}
