import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('vercel-public',{recursive:true});
await writeFile('vercel-public/health.txt','Tamandare shared application gateway\n');
