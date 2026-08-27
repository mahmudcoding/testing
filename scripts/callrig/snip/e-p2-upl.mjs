import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => await page.evaluate(async ({WS}) => {
  const fd=new FormData();
  const blob=new Blob(['reconnect probe file\n'],{type:'text/plain'});
  fd.append('file', blob, 'qa-e-reconnect-probe.txt');
  fd.append('workspace_id', WS);
  const r=await fetch('/api/v1/files/upload',{method:'POST',credentials:'include',body:fd});
  const t=await r.text();
  return {status:r.status, body:t.slice(0,200)};
}, {WS});
