import test from 'node:test';
import assert from 'node:assert/strict';
import {recoveryBody} from '../lib/order-recovery.ts';
test('recovery preserves the original Pix choice and identity',()=>{
 const ref={id:'order-a',token:'secret-a',paymentMethod:'pix'};
 assert.deepEqual(recoveryBody(ref,null,'card'),{...ref,action:'resume'});
 assert.deepEqual(recoveryBody(ref,{id:'other',token:'other',payload:{paymentMethod:'card'}},'card'),{...ref,action:'resume'});
 const saved={...ref,payload:{items:[{id:'drink',quantity:1}],paymentMethod:'pix'}};
 assert.deepEqual(recoveryBody(ref,saved,'card'),{items:[{id:'drink',quantity:1}],...ref});
});
test('legacy references recover with the explicitly selected method',()=>{
 assert.deepEqual(recoveryBody({id:'a',token:'b'},null,'pix'),{id:'a',token:'b',paymentMethod:'pix',action:'resume'});
});
