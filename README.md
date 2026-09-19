# prints

Galeria estatica simples pra compartilhar prints sem spamar ninguem no zap. Publicada
via GitHub Pages.

## Como adicionar um album novo

1. Crie uma pasta em `images/<slug-do-album>/` e coloque as imagens dentro (jpg/png/webp/gif).
2. (Opcional) Coloque miniaturas com o **mesmo nome de arquivo** em
   `images/<slug-do-album>/thumbs/` pra deixar o grid mais leve. Se nao existir
   miniatura, a imagem original e usada direto.
3. (Opcional) Crie `images/<slug-do-album>/album.json` pra customizar titulo/data/descricao:
   ```json
   { "title": "Nome bonito", "date": "Setembro 2026", "description": "..." }
   ```
4. Rode `node scripts/build.js` pra atualizar `data/albums.json`.
5. Commit e push. O GitHub Pages atualiza sozinho em 1-2 minutos.

## Rodar localmente

Qualquer servidor estatico funciona (precisa ser via http, `file://` nao carrega o JSON).
Exemplo rapido com Node (sem instalar nada):

```bash
node -e "require('http').createServer((req,res)=>{const fs=require('fs'),path=require('path');let p=req.url==='/'?'/index.html':req.url;const f=path.join(process.cwd(),decodeURIComponent(p));fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.end(d)})}).listen(8080,()=>console.log('http://localhost:8080'))"
```
