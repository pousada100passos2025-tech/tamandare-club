import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import ts from 'typescript';import {readFileSync} from 'node:fs';
test('gateway transport credential can be repaired without rotating Exclusive identity hashes',async()=>{
 const env={COMMERCE_GATEWAY_TOKEN:'new-test-transport-key',COMMERCE_PAYMENT_TOKEN:'existing-identity-sealing-key'};
 const fetch=async(_url,options)=>options.headers.Authorization==='Bearer new-test-transport-key'?Response.json({configured:true}):Response.json({error:'Acesso não autorizado.'},{status:401});
 for(const [file,name] of [['pos.ts','paymentBridge'],['exclusive.ts','exclusiveBridge'],['registration-mail.ts','registrationMail']]){
  const source=readFileSync(new URL('../lib/'+file,import.meta.url),'utf8').replace(/^import .*;\n/gm,'');const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const exports={};
  vm.runInNewContext(output,{exports,env,fetch,Response,AbortSignal,PosError:class extends Error{}});assert.equal((await exports[name]({action:'status'})).configured,true,file);
 }
});
