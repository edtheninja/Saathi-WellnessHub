import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";

/* =========================================================
   MUSIC DIRECTORY PLUGIN

   Scans:
   public/Music/

   Supported:
   .mp3
   .wav
   .ogg
   .m4a
   .webm
========================================================= */

function musicLibraryPlugin(): Plugin {
  const virtualModuleId = "virtual:music-library";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  const getMusicFiles = () => {
    const musicDirectory = path.resolve(
      process.cwd(),
      "public",
      "Music"
    );

    if (!fs.existsSync(musicDirectory)) {
      console.warn(
        `[music-library] Directory not found: ${musicDirectory}`
      );

      return [];
    }

    const supportedExtensions = new Set([
      ".mp3",
      ".wav",
      ".ogg",
      ".m4a",
      ".webm",
    ]);

    return fs
      .readdirSync(musicDirectory, {
        withFileTypes: true,
      })
      .filter(
        (entry) =>
          entry.isFile() &&
          supportedExtensions.has(
            path.extname(entry.name).toLowerCase()
          )
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      )
      .map((entry) => ({
        name: entry.name,
        src: `/Music/${encodeURIComponent(entry.name)}`,
      }));
  };

  return {
    name: "music-library",

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }

      return undefined;
    },

    load(id) {
      if (id !== resolvedVirtualModuleId) {
        return undefined;
      }

      const musicFiles = getMusicFiles();

      return `
        export default ${JSON.stringify(musicFiles)};
      `;
    },

    configureServer(server) {
      const musicDirectory = path.resolve(
        process.cwd(),
        "public",
        "Music"
      );

      /*
       * Refresh virtual module whenever a music file
       * is added, removed, or renamed.
       */
      server.watcher.add(musicDirectory);

      server.watcher.on("add", (file) => {
        if (file.startsWith(musicDirectory)) {
          server.moduleGraph.invalidateModule(
            server.moduleGraph.getModuleById(
              resolvedVirtualModuleId
            )!
          );

          server.ws.send({
            type: "full-reload",
          });
        }
      });

      server.watcher.on("unlink", (file) => {
        if (file.startsWith(musicDirectory)) {
          server.ws.send({
            type: "full-reload",
          });
        }
      });

      server.watcher.on("change", (file) => {
        if (file.startsWith(musicDirectory)) {
          server.ws.send({
            type: "full-reload",
          });
        }
      });
    },
  };
}

/* =========================================================
   VITE CONFIG
========================================================= */

export default defineConfig(({ mode }) => ({
  base:
    process.env.VERCEL
      ? "/"
      : mode === "production"
      ? "/Saathi/"
      : "/",

  /* =======================================================
     DEV SERVER
  ======================================================= */

  server: {
    proxy: {
      "/api": "http://localhost:4000",

      "/socket.io": {
        target: "http://localhost:4000",
        ws: true,
      },
    },
  },

  /* =======================================================
     PLUGINS
  ======================================================= */

  plugins: [
    react(),

    /*
     * Automatically scans public/Music
     */
    musicLibraryPlugin(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "icons/icon-192x192.png",
        "icons/icon-512x512.png",
      ],

      manifest: {
        name: "Saathi – Zen Companion",
        short_name: "Saathi",
        description:
          "Mood tracker, journal and meditations by Ansh Verma.",

        start_url: ".",
        scope: ".",
        display: "standalone",

        background_color: "#ffffff",
        theme_color: "#2a8f6b",

        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  /* =======================================================
     ALIASES
  ======================================================= */

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));