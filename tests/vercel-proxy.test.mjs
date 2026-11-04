import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createProxy} from '../lib/vercel-proxy.mjs';
test('Vercel forwards the same checkout, cookies and origin without permitting cross-site writes',async()=>{
 const calls=[];
 const proxy=createProxy(async(url,options)=>{calls.push({url:String(url),...options});return new Response('{"status":"pending"}',{headers:{'Content-Type':'application/json','Set-Cookie':'device=private; Path=/; Secure; HttpOnly'}});});
 const server=http.createServer(proxy);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const response=await fetch(base+'/api/site-proxy?__path=/api/pedidos&recovery=1',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:'device=existing'},body:'{"id":"same-order"}'});
  assert.equal(response.status,200);assert.equal(calls.length,1);assert.equal(calls[0].url,'https://tamandareclub.com.br/api/pedidos?recovery=1');
  assert.equal(calls[0].headers.get('origin'),'https://tamandareclub.com.br');assert.equal(calls[0].headers.get('cookie'),'device=existing');assert.equal(Buffer.from(calls[0].body).toString(),'{"id":"same-order"}');
  assert.equal(response.headers.get('set-cookie'),'device=private; Path=/; Secure; HttpOnly');assert.equal(response.headers.get('cache-control'),'no-store');
  const blocked=await fetch(base+'/api/site-proxy?__path=/api/pedidos',{method:'POST',headers:{Origin:'https://untrusted.invalid','Content-Type':'application/json'},body:'{}'});assert.equal(blocked.status,403);assert.equal(calls.length,1);
  await fetch(base+'/api/site-proxy?__path=//untrusted.invalid/path');assert.equal(new URL(calls[1].url).origin,'https://tamandareclub.com.br');
 }finally{await new Promise(r=>server.close(r));}
});
