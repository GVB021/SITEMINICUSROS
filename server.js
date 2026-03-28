import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Desabilitar cache para evitar problemas de MIME type
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve arquivos estáticos
app.use(express.static(distPath));

// SPA fallback - NUNCA serve HTML para /assets/
app.get('*', (req, res) => {
  // Se é um asset, retorna 404 se não existe
  if (req.path.startsWith('/assets/')) {
    return res.status(404).send('Asset not found');
  }
  // Para rotas de página, serve index.html
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
