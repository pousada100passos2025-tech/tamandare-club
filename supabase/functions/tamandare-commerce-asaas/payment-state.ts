export const PAYMENT_EVENTS=['PAYMENT_CONFIRMED','PAYMENT_RECEIVED','PAYMENT_REFUNDED','PAYMENT_PARTIALLY_REFUNDED','PAYMENT_REFUND_IN_PROGRESS','PAYMENT_REFUND_DENIED','PAYMENT_CHARGEBACK_REQUESTED','PAYMENT_CHARGEBACK_DISPUTE','PAYMENT_AWAITING_CHARGEBACK_REVERSAL'];
export function paymentSnapshot(payment:Record<string,any>,total:number){
 if(!Number.isFinite(payment.value)||Math.round(payment.value*100)!==total)throw new Error('Payment amount mismatch');
 const refunds=Array.isArray(payment.refunds)?payment.refunds:[];let refundedCents=0;const ids=new Set<string>();
 for(const refund of refunds){if(refund.status!=='DONE')continue;if(!Number.isFinite(refund.value)||refund.value<=0)throw new Error('Invalid refund');if(refund.id){if(ids.has(refund.id))continue;ids.add(refund.id);}refundedCents+=Math.round(refund.value*100);}
 if(refundedCents>total)throw new Error('Refund exceeds payment');
 let financialState='clear';
 if(payment.status==='REFUNDED'){financialState='refunded';refundedCents=total;}
 else if(payment.status==='CHARGEBACK_REQUESTED')financialState='chargeback';
 else if(payment.status==='CHARGEBACK_DISPUTE')financialState='dispute';
 else if(payment.status==='AWAITING_CHARGEBACK_REVERSAL')financialState='awaiting_reversal';
 else if(['REFUND_REQUESTED','REFUND_IN_PROGRESS'].includes(payment.status)||refunds.some((r:Record<string,unknown>)=>r.status==='PENDING'))financialState='refund_pending';
 else if(!['CONFIRMED','RECEIVED'].includes(payment.status))return null;
 else if(refundedCents===total)financialState='refunded';else if(refundedCents>0)financialState='partially_refunded';
 return {financialState,refundedCents};
}
