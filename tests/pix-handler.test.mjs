import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {paymentSnapshot,PAYMENT_EVENTS} from '../supabase/functions/tamandare-commerce-asaas/payment-state.ts';

for(const channel of ['pdv','site'])test(`Pix ${channel}: single-use, recoverable and confirms only canonical exact payments`,async()=>{
 const token='test-only-token-0000000000000000000000000000';
 const digest=async s=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))).toString('hex');
 const key={id:'tamandare-commerce',token_hash:await digest(token),webhook_hash:await digest(token),webhook_id:'hook',events_version:2,company_id:'company'};
 const rows=[];const requests=[];let payment=null;let snapshots=0;let qrStatus=400;
 class Query{
  constructor(table){this.table=table;this.filters=[];}
  select(){return this;}eq(k,v){this.filters.push(r=>r[k]===v);return this;}neq(k,v){this.filters.push(r=>r[k]!==v);return this;}
  update(v){this.values=v;return this;}insert(v){if(rows.some(r=>r.id===v.id))this.error={message:'duplicate'};else rows.push({...v});return this;}
  result(single=false){const all=this.table==='tamandare_gateway_keys'?[key]:this.table==='integracao_conexoes'?[{empresa_id:'company',provedor:'asaas',status:'ativa'}]:rows;const selected=all.filter(r=>this.filters.every(f=>f(r)));if(this.values)selected.forEach(r=>Object.assign(r,this.values));return{data:single?selected[0]??null:selected,error:this.error??null};}
  single(){return Promise.resolve(this.result(true));}maybeSingle(){return this.single();}then(a,b){return Promise.resolve(this.result()).then(a,b);}
 }
 const client={from:t=>new Query(t),rpc:async(name,args)=>{if(name==='tamandare_record_payment_snapshot'){snapshots++;const row=rows.find(r=>r.checkout_id===args.p_checkout_id);Object.assign(row,{status:'paid',payment_id:args.p_payment_id,financial_state:args.p_state,financial_revision:1});}return{data:true,error:null};}};
 const fetch=async(url,opts)=>{const u=new URL(url),body=opts.body?JSON.parse(opts.body):null;requests.push({path:u.pathname,method:opts.method,body});
  if(u.pathname==='/v3/pix/addressKeys')return Response.json({data:[{key:'account-test-key',status:'ACTIVE',type:'EVP'}]});
  if(u.pathname==='/v3/pix/qrCodes/static'&&opts.method==='POST'&&body.description.length>37)return Response.json({errors:[{code:'invalid_action',description:'A descrição deste QR Code não deve ultrapassar 37 caracteres.'}]},{status:400});
  if(u.pathname==='/v3/pix/qrCodes/static'&&opts.method==='POST'&&qrStatus!==200)return Response.json({errors:[{code:'invalid_description',description:'Invalid description'}]},{status:qrStatus});
  if(u.pathname==='/v3/pix/qrCodes/static'&&opts.method==='POST')return Response.json({id:'qr_test',encodedImage:'aW1hZ2U=',payload:'000201-test-pix',expirationDate:'2026-10-26 23:00:00',allowsMultiplePayments:false});
  if(u.pathname==='/v3/payments')return Response.json({hasMore:false,data:payment?[payment]:[]});
  if(u.pathname==='/v3/payments/pay_test')return Response.json(payment);
  throw new Error('Unexpected provider route '+u.pathname);
 };
 let handler;const source=readFileSync(new URL('../supabase/functions/tamandare-commerce-asaas/index.ts',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 vm.runInNewContext(compiled,{createClient:()=>client,paymentSnapshot,PAYMENT_EVENTS,sendPurchaseNotification:async()=>{},Deno:{serve:h=>handler=h,env:{get:k=>({ASAAS_API_KEY:'fake',ASAAS_BASE_URL:'https://api.asaas.com/v3',SUPABASE_URL:'https://fake.invalid',SUPABASE_SERVICE_ROLE_KEY:'fake'})[k]}},crypto,Request,Response,URL,TextEncoder,AbortSignal,fetch,console});
 const id='00000000-0000-4000-8000-000000000003';
 const req=(body,hook=false)=>handler(new Request('https://fake.invalid/'+(hook?'?hook=1':''),{method:'POST',headers:{'Content-Type':'application/json',...(hook?{'asaas-access-token':token}:{Authorization:'Bearer '+token})},body:JSON.stringify(body)}));
 const create={action:'pix',source:channel,orderId:id,totalCents:2500,returnUrl:'https://tamandareclub.com.br/cardapio'};
 const rejected=await req(create);assert.equal(rejected.status,503);assert.equal(rows[0].status,'failed','a definitive rejection must permit recovery of the same order');qrStatus=200;
 const first=await req(create);assert.equal(first.status,200);const qr=await first.json();assert.equal(qr.pix.payload,'000201-test-pix');assert.equal(qr.status,'active');
 const sent=requests.find(r=>r.path==='/v3/pix/qrCodes/static').body;assert.equal(sent.value,25);assert.equal(sent.allowsMultiplePayments,false);assert.equal(sent.expirationSeconds,600);
 assert.equal((await req(create)).status,200);assert.equal(requests.filter(r=>r.path==='/v3/pix/qrCodes/static').length,2,'retry must reuse the QR');
 assert.equal((await req({...create,totalCents:2600})).status,409);
 assert.equal((await req({action:'lookup',source:channel,orderId:id})).status,200);assert.equal(snapshots,0,'pending QR is not payment');
 payment={id:'pay_test',pixQrCodeId:'qr_other',value:25,status:'RECEIVED'};
 const hook={id:'evt_pix_wrong',event:'PAYMENT_RECEIVED',payment:{id:'pay_test'}};
 await req(hook,true);assert.equal(snapshots,0,'foreign QR must never pay this order');
 payment={...payment,pixQrCodeId:'qr_test',value:24};assert.equal((await req({...hook,id:'evt_wrong_amount'},true)).status,503);assert.equal(snapshots,0);
 payment={...payment,value:25};assert.equal((await req({...hook,id:'evt_paid'},true)).status,200);assert.equal(snapshots,1);assert.equal(rows[0].status,'paid');
 assert.equal((await req(create)).status,200);assert.equal(requests.filter(r=>r.path==='/v3/pix/qrCodes/static').length,2,'paid order cannot generate a second QR');
 const ambiguous={...create,orderId:'00000000-0000-4000-8000-000000000004'};qrStatus=500;assert.equal((await req(ambiguous)).status,503);assert.equal(rows.at(-1).status,'creating');const before=requests.length;assert.equal((await req(ambiguous)).status,409);assert.equal(requests.length,before,'ambiguous writes must never be repeated');

});
