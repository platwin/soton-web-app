import { defineConfig } from "umi";

export default defineConfig({
  define: {
    "process.env.CHAIN_ENV": "TONtest",
    "process.env.TON_SERVER": "http://127.0.0.1:3000",
  },
});
