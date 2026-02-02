/**
 * AWL Scanner - Server Startup Script
 * For local development only. Vercel uses api/index.js instead.
 */
const app = require('./server-app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     AWL Scanner - Aanwezigheidslijst      ║
  ║         Scanner voor Trainers             ║
  ╠═══════════════════════════════════════════╣
  ║  Server draait op: http://localhost:${PORT}  ║
  ╚═══════════════════════════════════════════╝
  `);
});
