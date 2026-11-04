import {createHmac} from 'node:crypto';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
const UPSTREAM='https://tamandareclub.com.br';
const excluded=new Set(['host','connection','keep-alive','transfer-encoding','content-length','accept-encoding','upgrade','proxy-authorization','proxy-authenticate','te','trailer','forwarded','x-forwarded-host','x-forwarded-proto','x-forwarded-for','x-real-ip','cf-connecting-ip']);
export function createProxy(upstreamFetch=fetch){return async(req,res)=>{
 try{
  const protocol=req.headers['x-forwarded-proto']==='https'?'https':'http';
  const incoming=new URL(req.url,`${protocol}://${req.headers.host}`);
  const origin=req.headers.origin;
  if(!['GET','HEAD'].includes(req.method)&&((origin&&origin!==incoming.origin)||req.headers['sec-fetch-site']==='cross-site')){
   res.writeHead(403,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Origem não permitida.'}));return;
  }
  const target=new URL(UPSTREAM);target.pathname=incoming.searchParams.get('__path')||incoming.pathname;
  incoming.searchParams.delete('__path');target.search=incoming.search;
  const headers=new Headers();
  for(const [name,value] of Object.entries(req.headers))if(value!==undefined&&!excluded.has(name)&&!name.startsWith('x-tamandare-proxy-')&&!name.startsWith('x-vercel-'))headers.set(name,Array.isArray(value)?value.join(', '):value);
  if(origin)headers.set('origin',UPSTREAM);
  headers.set('accept-encoding','identity');
  const secret=process.env.SITE_PROXY_SECRET,ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'').split(',')[0].trim();
  if(secret&&ip){const at=String(Date.now());headers.set('x-tamandare-proxy-ip',ip);headers.set('x-tamandare-proxy-at',at);headers.set('x-tamandare-proxy-signature',createHmac('sha256',secret).update(at+'\n'+ip).digest('hex'));}
  let body;
  if(!['GET','HEAD'].includes(req.method)){
   if(req.body!==undefined)body=Buffer.isBuffer(req.body)?req.body:typeof req.body==='string'?Buffer.from(req.body):Buffer.from(JSON.stringify(req.body));
   else{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>4500000){res.writeHead(413);res.end();return;}chunks.push(chunk);}body=Buffer.concat(chunks);}
  }
  const response=await upstreamFetch(target,{method:req.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(120000)});
  res.statusCode=response.status;
  response.headers.forEach((value,name)=>{if(!excluded.has(name)&&!['set-cookie','content-encoding'].includes(name))res.setHeader(name,value);});
  const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('set-cookie',cookies.map(cookie=>cookie.replace(/;\s*Domain=\.?tamandareclub\.com\.br/ig,'')));
  const location=response.headers.get('location');if(location){const redirect=new URL(location,target);if(redirect.origin===UPSTREAM)res.setHeader('location',incoming.origin+redirect.pathname+redirect.search+redirect.hash);}
  res.setHeader('Cache-Control','no-store');
  if(req.method==='HEAD'||!response.body)res.end();else await pipeline(Readable.fromWeb(response.body),res);
 }catch{if(!res.headersSent){res.writeHead(502,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'O site está temporariamente indisponível. Acesse tamandareclub.com.br e consulte seu pedido antes de repetir.'}));}else res.destroy();}
};}
