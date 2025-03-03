import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'b759-2405-201-5507-c076-18df-d11a-c88a-4da6.ngrok-free.app', // Add your ngrok URL here
    ]
  }
})
