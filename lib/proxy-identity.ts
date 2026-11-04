export async function requestIp(request:Request,secret:string){
 const fallback=request.headers.get('cf-connecting-ip')||'unknown';
 const ip=request.headers.get('x-tamandare-proxy-ip')||'',at=request.headers.get('x-tamandare-proxy-at')||'',signature=request.headers.get('x-tamandare-proxy-signature')||'';
 if(!secret||!ip||ip.length>64||!/^[0-9a-f:.]+$/i.test(ip)||!/^\d{13}$/.test(at)||Math.abs(Date.now()-Number(at))>60000||!/^[a-f0-9]{64}$/.test(signature))return fallback;
 try{
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const bytes=Uint8Array.from(signature.match(/../g)!,s=>parseInt(s,16));
  return await crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(at+'\n'+ip))?ip:fallback;
 }catch{return fallback;}
}
