export function nextMonth(day){if(!/^\d{4}-\d{2}-\d{2}$/.test(day||''))return null;const [y,m,d]=day.split('-').map(Number);const last=new Date(Date.UTC(y,m+1,0)).getUTCDate();return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-${String(Math.min(d,last)).padStart(2,'0')}T03:00:00.000Z`;}
export function entitlement(payments,subscriptionId,now=Date.now()){
 let until=null;for(const p of payments){if(p.subscription!==subscriptionId||Math.round(Number(p.value)*100)!==5000||p.deleted||!['CONFIRMED','RECEIVED'].includes(p.status)||(p.refunds?.length||0)>0)continue;const start=Date.parse(p.dueDate+'T03:00:00.000Z'),end=nextMonth(p.dueDate);if(Number.isFinite(start)&&start<=now&&end&&Date.parse(end)>now&&(!until||end>until))until=end;}
 return {active:!!until,validUntil:until,discountPercent:until?15:0};
}

export function pixEntitlement(payments,checkoutId,now=Date.now()){
 let until=null,paidCycle=false;
 for(const p of payments){const checkout=typeof p.checkoutSession==='object'?p.checkoutSession?.id:p.checkoutSession;
  if(checkout!==checkoutId||p.billingType!=='PIX'||p.subscription||Math.round(Number(p.value)*100)!==5000||p.deleted||!['CONFIRMED','RECEIVED'].includes(p.status)||(p.refunds?.length||0)>0)continue;
  const day=String(p.paymentDate||p.clientPaymentDate||p.confirmedDate||'').slice(0,10),end=nextMonth(day),start=Date.parse(day+'T03:00:00.000Z');
  if(!Number.isFinite(start)||start>now||!end)continue;
  paidCycle=true;if(!until||end>until)until=end;
 }
 const active=!!until&&Date.parse(until)>now;
 return {active,validUntil:until,discountPercent:active?15:0,paidCycle};
}
