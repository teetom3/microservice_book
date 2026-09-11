const gateway = require("fast-gateway");

// Attention : avec fast-gateway, pathRegex '*' ne couvre QUE le chemin nu
// (/api/orders) et le defaut '/*' ne couvre QUE les sous-chemins
// (/api/orders/123). Chaque service a donc besoin de DEUX entrees, sinon
// les sous-chemins retombent sur la route generale /api et partent au
// mauvais service.
const server = gateway({
  routes: [
    // --- commandes ---
    {
      prefix: "/api/orders",
      pathRegex: "*",
      prefixRewrite: "/orders",
      target: "http://orders:3001",
    },
    {
      prefix: "/api/orders",
      prefixRewrite: "/orders",
      target: "http://orders:3001",
    },

    // --- paiements ---
    {
      prefix: "/api/payments",
      pathRegex: "*",
      prefixRewrite: "/payments",
      target: "http://payments:3002",
    },
    {
      prefix: "/api/payments",
      prefixRewrite: "/payments",
      target: "http://payments:3002",
    },

    // --- livres (route generale, apres les specifiques) ---
    { prefix: "/api", target: "http://back:3000" },

    // --- front (attrape-tout, en dernier) ---
    {
      prefix: "/",
      prefixRewrite: "/",
      pathRegex: "*",
      target: "http://front:4000",
    },
  ],
});

server.start(8080);
