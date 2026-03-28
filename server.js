import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Serve arquivos estáticos com cache
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: true
}));

// SPA fallback - apenas se não for um arquivo real
app.get('*', (req, res) => {
  const filePath = path.join(distPath, req.path);
  // Se o arquivo existe, deixa o static middleware servir
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  // Caso contrário, serve index.html para SPA
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
