self.addEventListener("install", (e) => {
  console.log("Service Worker instalado");
});

self.addEventListener("fetch", (event) => {
  // Pode melhorar depois com cache
});