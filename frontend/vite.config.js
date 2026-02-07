import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/SkillTracker/" : "/",
  server: {
    host: "127.0.0.1",
    proxy: {
      "/health": "http://localhost:3000",
      "/skills": "http://localhost:3000",
      "/study-log": "http://localhost:3000",
    },
  },
});
