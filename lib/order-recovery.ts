export type OrderReference={id:string;token:string;paymentMethod?:string};
export function recoveryBody(ref:OrderReference,saved:unknown,method:string):Record<string,unknown>{
 const entry=saved&&typeof saved==='object'?saved as Record<string,unknown>:null;
 const payload=entry?.id===ref.id&&entry.token===ref.token&&entry.payload&&typeof entry.payload==='object'?entry.payload as Record<string,unknown>:null;
 const original=payload?.paymentMethod||ref.paymentMethod||method;
 const paymentMethod=original==='card'?'card':'pix';
 return payload?{...payload,...ref,paymentMethod}:{...ref,paymentMethod,action:'resume'};
}
