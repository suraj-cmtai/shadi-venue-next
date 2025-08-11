"use client"

import { Provider } from 'react-redux'
import { store } from './store'
import { ReactNode } from 'react'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

// Create persistor
const persistor = persistStore(store);

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
} 