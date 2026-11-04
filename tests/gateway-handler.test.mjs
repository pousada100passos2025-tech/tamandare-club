import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';import ts from 'typescript';
import {paymentSnapshot,PAYMENT_EVENTS} from '../supabase/functions/tamandare-commerce-asaas/payment-state.ts';
const uuid='00000000-0000-4000-8000-000000000001',checkout='00000000-0000-4000-8000-000000000002';
test('actual gateway validates token, canonical amount and checkout membership; updates its own webhook and uses a 10 minute checkout',async()=>{
 const token='test-token-000000000000000000000000000000000';const hash=async s=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))).toString('hex');
 const key={id:'tamandare-commerce',token_hash:await hash(token),webhook_hash:await hash(token),company_id:uuid,webhook_id:'test-hook',events_version:0};
 const order={id:'site:'+uuid,source:'site',total_cents:1000,status:'paid',checkout_id:checkout,payment_id:'pay_test',financial_state:'clear',refunded_cents:0};let currentPayment={id:'pay_test',value:10,status:'REFUNDED',checkoutSession:checkout},linked=true;let events=['CHECKOUT_PAID'];const rpc=[],requests=[];const rows=[order],locks=new Map(),notifications=new Map();let pauseCanonical=null,canonicalSeen=null;
 class Query{constructor(table){this.table=table;this.filters=[];this.values=null;}select(){return this;}eq(k,v){this.filters.push(r=>r[k]===v);return this;}neq(k,v){this.filters.push(r=>r[k]!==v);return this;}in(k,v){this.filters.push(r=>v.includes(r[k]));return this;}update(v){this.values=v;return this;}insert(v){rows.push(v);this.inserted=true;return this;}result(single=false){const all=this.table==='tamandare_gateway_notifications'?[...notifications.values()]:this.table==='tamandare_gateway_keys'?[key]:this.table==='integracao_conexoes'?[{empresa_id:uuid,provedor:'asaas',status:'ativa'}]:rows;const selected=all.filter(r=>this.filters.every(f=>f(r)));if(this.values)selected.forEach(r=>Object.assign(r,this.values));return{data:single?selected[0]??null:selected,error:null};}single(){return Promise.resolve(this.result(true));}maybeSingle(){return this.single();}then(resolve,reject){return Promise.resolve(this.result()).then(resolve,reject);}}
 const client={from:t=>new Query(t),rpc:async(name,args)=>{rpc.push({name,args});if(name==='tamandare_claim_notification'){if(notifications.get(args.p_id)?.status==='sent')return{data:false,error:null};notifications.set(args.p_id,{id:args.p_id,status:'sending'});return{data:true,error:null};}if(name==='tamandare_claim_payment_refresh'){if(locks.has(args.p_checkout_id))return{data:false,error:null};locks.set(args.p_checkout_id,args.p_lock_token);}if(name==='tamandare_release_payment_refresh'&&locks.get(args.p_checkout_id)===args.p_lock_token)locks.delete(args.p_checkout_id);if(name==='tamandare_record_payment_snapshot'){assert.equal(locks.get(args.p_checkout_id),args.p_lock_token);Object.assign(order,{financial_state:args.p_state,refunded_cents:args.p_refunded,financial_observed_at:new Date().toISOString()});}return{data:true,error:null};}};
 const snapshots=()=>rpc.filter(r=>r.name==='tamandare_record_payment_snapshot');
 const outbound=async(url,options)=>{const u=new URL(url);requests.push({host:u.hostname,path:u.pathname,method:options.method,body:options.body?JSON.parse(options.body):null});if(u.hostname==='api.resend.com'&&u.pathname==='/emails')return Response.json({id:'email-test'});if(u.pathname==='/v3/webhooks/test-hook'){if(options.method==='PUT')events=JSON.parse(options.body).events;return Response.json({url:'https://sbgwrdfhuvvvsacbdpho.supabase.co/functions/v1/tamandare-commerce-asaas?hook=1',events});}if(u.pathname==='/v3/myAccount/commercialInfo/')return Response.json({companyName:'TEST ONLY'});if(u.pathname==='/v3/payments/pay_test/refunds')return Response.json([]);if(u.pathname==='/v3/payments/pay_test'){const snapshot={...currentPayment};if(pauseCanonical){canonicalSeen?.();await pauseCanonical;}return Response.json(snapshot);}if(u.pathname==='/v3/payments'&&u.searchParams.get('checkoutSession')!==checkout)return Response.json({data:[]});if(u.pathname==='/v3/payments')return Response.json({hasMore:false,data:[{id:linked?'pay_test':'pay_other'}]});if(u.pathname==='/v3/checkouts'){const item=JSON.parse(options.body).items[0];if(item.name.length>30||item.description.length>150||typeof item.imageBase64!=='string'||item.imageBase64.length<100)return Response.json({errors:[{code:'invalid_object',description:'Invalid checkout item contract'}]},{status:400});return Response.json({id:checkout});}throw new Error('Unexpected provider path '+u.pathname);};
 let handler;const source=readFileSync(new URL('../supabase/functions/tamandare-commerce-asaas/index.ts',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true});assert.equal((compiled.diagnostics||[]).length,0);
 const mailSource=readFileSync(new URL('../supabase/functions/tamandare-commerce-asaas/notifications.ts',import.meta.url),'utf8');const mailCode=ts.transpileModule(mailSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/^export /gm,'');
 vm.runInNewContext(mailCode+compiled.outputText,{createClient:()=>client,paymentSnapshot,PAYMENT_EVENTS,Deno:{serve:h=>handler=h,env:{get:k=>({RESEND_API_KEY:'fake-mail-key',ASAAS_API_KEY:'fake-only',ASAAS_BASE_URL:'https://api.asaas.com/v3',SUPABASE_URL:'https://test.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-only'})[k]}},crypto,Request,Response,URL,TextEncoder,AbortSignal,fetch:outbound});
 const req=(body,hook=false,secret=token)=>handler(new Request('https://bridge.invalid/'+(hook?'?hook=1':''),{method:'POST',headers:{'Content-Type':'application/json',...(hook?{'asaas-access-token':secret}:{Authorization:'Bearer '+secret})},body:JSON.stringify(body)}));
 const event={id:'evt_test',event:'PAYMENT_REFUNDED',payment:{id:'pay_test',value:999,status:'RECEIVED'}};
 assert.equal((await req(event,true,'bad')).status,401);assert.equal(rpc.length,0);
 assert.equal((await req(event,true)).status,200);assert.equal(snapshots().at(-1).args.p_refunded,1000);assert.equal(snapshots().at(-1).args.p_total,1000,'use canonical amount, not payload');
 linked=false;const before=snapshots().length;assert.equal((await req({...event,id:'evt_unlinked'},true)).status,503);assert.equal(snapshots().length,before);linked=true;
 currentPayment={...currentPayment,value:1};assert.equal((await req({...event,id:'evt_wrong_amount'},true)).status,503);currentPayment={...currentPayment,value:10};
 assert.equal((await req({action:'status'})).status,200);assert.ok(PAYMENT_EVENTS.every(e=>events.includes(e)));assert.equal(key.events_version,2);assert.equal(requests.filter(r=>r.method==='PUT').length,1);
 const newId=crypto.randomUUID();assert.equal((await req({action:'create',source:'site',orderId:newId,totalCents:1000,returnUrl:'https://tamandareclub.com.br/cardapio'})).status,200);assert.equal(requests.find(r=>r.path==='/v3/checkouts').body.minutesToExpire,10);
 const billing={name:'Cliente teste',cpfCnpj:'12345678909',email:'teste@example.invalid',phone:'81999991234',address:'Rua Teste',addressNumber:'10',postalCode:'55578000',province:'Centro',complement:'',cardNumber:'must-not-forward',customer:'forged-customer'};
 assert.equal((await req({action:'create',source:'site',orderId:crypto.randomUUID(),totalCents:1000,returnUrl:'https://tamandareclub.com.br/cardapio',customerData:billing})).status,200);
 const prefilled=requests.filter(r=>r.path==='/v3/checkouts').at(-1).body.customerData;
 assert.equal(prefilled.name,billing.name);assert.equal(prefilled.address,billing.address);assert.equal(prefilled.cpfCnpj,billing.cpfCnpj);assert.equal(prefilled.cardNumber,undefined);assert.equal(prefilled.customer,undefined);
 const ticketId=crypto.randomUUID();
 const ticket={action:'create',source:'site',area:'reveillon',orderId:ticketId,totalCents:60000,eventDate:'2026-12-31',lot:1,quantity:1,returnUrl:'https://tamandareclub.com.br/reservas/reveillon',description:'2026-12-31 · Lote 1 · 1 ingresso',buyerEmail:'buyer@example.invalid',buyerName:'Comprador teste',receiptUrl:'https://tamandareclub.com.br/reservas/reveillon#compra='+ticketId+'&acesso='+ 'a'.repeat(64)};
 assert.equal((await req({...ticket,totalCents:1})).status,400);
 assert.equal((await req({...ticket,returnUrl:'https://other.invalid/'})).status,400);
 assert.equal((await req({...ticket,source:'pdv'})).status,400);
 assert.equal((await req(ticket)).status,200);
 const requestEmails=requests.filter(r=>r.host==='api.resend.com');assert.equal(requestEmails.length,1,'registered ticket purchases must send a request email');assert.match(requestEmails[0].body.subject,/Solicitação/);assert.doesNotMatch(requestEmails[0].body.subject,/confirmado/i);
 const checkoutRequest=requests.filter(r=>r.path==='/v3/checkouts').at(-1).body;
 assert.equal(checkoutRequest.externalReference,`tamandare:site:reveillon:${ticketId}`);
 assert.match(checkoutRequest.items[0].name,/Réveillon 2027/);
 assert.match(checkoutRequest.items[0].description,/Origem: Site \| Área: Réveillon 2027/);
 assert.equal(rows.find(r=>r.id==='site:'+ticketId).origin_area,'reveillon');
 assert.equal(rows.find(r=>r.id==='site:'+ticketId).company_id,uuid);
 assert.equal((await req({...ticket,eventDate:'2027-01-01'})).status,409,'do not reuse an existing payment for another event date');
 const failed=rows.find(r=>r.id==='site:'+ticketId);Object.assign(failed,{status:'failed',checkout_id:null,checkout_url:null});
 const countBeforeRetry=requests.filter(r=>r.path==='/v3/checkouts').length;
 assert.equal((await req(ticket)).status,200);
 assert.equal(requests.filter(r=>r.path==='/v3/checkouts').length,countBeforeRetry+1,'a definitively rejected creation must be retryable with the same order');
 assert.equal(rows.filter(r=>r.id==='site:'+ticketId).length,1);assert.equal(requests.filter(r=>r.host==='api.resend.com').length,1,'recovery must not resend the request email');
 const countAfterRetry=requests.filter(r=>r.path==='/v3/checkouts').length;
 assert.equal((await req(ticket)).status,200);assert.equal(requests.filter(r=>r.path==='/v3/checkouts').length,countAfterRetry,'an existing successful checkout is reused');
 // Even linked payments are refreshed so a missed webhook eventually heals.
 order.financial_observed_at='2026-01-01T00:00:00Z';const previous=snapshots().length;
 assert.equal((await req({action:'lookup_many',orders:[{orderId:uuid,source:'site'}]})).status,200);assert.equal(snapshots().length,previous+1);
 // A broken old row cannot block the healthy row in the same batch.
 const brokenId=crypto.randomUUID();rows.unshift({id:'site:'+brokenId,source:'site',total_cents:1000,status:'paid',checkout_id:crypto.randomUUID(),payment_id:'pay_missing'});order.financial_observed_at='2026-01-01T00:00:00Z';
 const batch=await req({action:'lookup_many',orders:[{orderId:brokenId,source:'site'},{orderId:uuid,source:'site'}]});assert.equal(batch.status,200);const batchData=await batch.json();assert.equal(batchData.orders[0].status,'unavailable');assert.equal(batchData.orders[1].financialState,'refunded');
 // Serial observation prevents an overlapping canonical fetch from clearing a chargeback.
 currentPayment={...currentPayment,status:'CHARGEBACK_REQUESTED'};let release;pauseCanonical=new Promise(resolve=>release=resolve);const entered=new Promise(resolve=>canonicalSeen=resolve);
 const first=req({...event,id:'evt_serial_1'},true);await entered;
 assert.equal((await req({...event,id:'evt_serial_2'},true)).status,503);release();assert.equal((await first).status,200);pauseCanonical=null;assert.equal(snapshots().at(-1).args.p_state,'chargeback');

});
