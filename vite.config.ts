import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        customer: resolve(__dirname, 'customer.html'),
        staff: resolve(__dirname, 'staff.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
})
