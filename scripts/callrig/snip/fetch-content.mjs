export default async ({page}) => await page.evaluate(async(rid)=>{
  const out={};
  for (const p of [`/api/v1/meeting/recordings/${rid}/content`, `/api/v1/meeting/recordings/${rid}`]) {
    try { const r = await fetch(p, {credentials:'include', headers:{Range:'bytes=0-1023'}});
      out[p] = {status:r.status, type:r.headers.get('content-type'), len:r.headers.get('content-length'), disp:r.headers.get('content-disposition')};
    } catch(e){ out[p]='ERR '+String(e).slice(0,80); }
  }
  return out;
}, process.env.QA_RID);
