# PixTurbinado

Sistema de funil de conversão com múltiplas páginas.

## Estrutura

- `/` - Página principal
- `/1` até `/11` - Páginas numeradas do funil
- `/back`, `/saque`, `/iof`, `/up1-up5` - Páginas especiais

## Tecnologia

- **Servidor**: Node.js + Express
- **Deploy**: Render.com
- **MIME Types**: Corrigidos via servidor Express

## Problema Resolvido

O site estava configurado como site estático no Render, mas o servidor não estava aplicando os MIME types corretos, causando erros como:

- `Refused to apply style... MIME type 'text/plain'`
- `Refused to execute script... MIME type 'text/plain'`

**Solução**: Migração para web service Node.js que força os MIME types corretos.

## Deploy

1. Push para repositório Git
2. Conectar ao Render.com
3. Render executará automaticamente:
   ```bash
   npm install
   node server.js
   ```

## Desenvolvimento Local

```bash
npm install
npm start
```

Servidor rodará em `http://localhost:3000`

## Features

- ✅ MIME types corretos para todos os arquivos
- ✅ Decodificação automática de URLs (`%2540` → `@`)
- ✅ Headers de segurança
- ✅ Roteamento para todas as páginas
- ✅ Tratamento de 404
- ✅ Logs de debug
