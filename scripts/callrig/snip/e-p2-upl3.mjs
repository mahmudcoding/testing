import {WS} from './e-p2-helpers.mjs';
const GEN='C4QEGENERAL0001';
export default async ({page}) => await page.evaluate(async ({WS,GEN}) => {
  const fd=new FormData();
  fd.append('file', new Blob(['recon3\n'],{type:'text/plain'}), 'qa-e-recon3.txt');
  fd.append('workspace_id', WS);
  const u=await fetch('/api/v1/files/upload',{method:'POST',credentials:'include',body:fd});
  const uj=await u.json();
  const sh=await fetch(`/api/v1/files/${uj.id}/shares`,{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'}, body:JSON.stringify({type:'channel',target_id:GEN})});
  return {upload:u.status, share:sh.status, id:uj.id};
}, {WS,GEN});
