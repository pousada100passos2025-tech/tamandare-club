export type DraftSale = {
 id: string; createdAt: string; table: string; customerName: string;
 waiterName: string; items: { name: string; quantity: number; unitPriceCents: number }[];
 totalCents: number; paymentMethod: "cash" | "pending"; receivedCents?: number;
 status: "local_only";
};
const DATABASE = "tamandare-pdv-offline-v1";
const STORE = "drafts";
function open(): Promise<IDBDatabase> {
 return new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE, 1);
  request.onupgradeneeded = () => {
   if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, {keyPath:"id"});
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
 });
}
export async function saveDraft(draft: DraftSale): Promise<void> {
 const db = await open();
 await new Promise<void>((resolve,reject)=>{
  const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(draft);
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
 });
 db.close();
}
export async function listDrafts(): Promise<DraftSale[]> {
 const db=await open();
 const records=await new Promise<DraftSale[]>((resolve,reject)=>{
  const tx=db.transaction(STORE,"readonly");const request=tx.objectStore(STORE).getAll();
  request.onsuccess=()=>resolve(request.result as DraftSale[]);request.onerror=()=>reject(request.error);
 });
 db.close();return records.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
