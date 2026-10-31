import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sensus - Clínica Universitária",
    short_name: "Sensus",
    description: "Portal do paciente e painel do profissional da clínica de psicologia.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9FAFB",
    theme_color: "#004E6E",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}