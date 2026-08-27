export default async ({page}) => {
  return await page.evaluate(async()=>{
    const out={};
    for (const [k,id] of [['png','F4OWBD79HC09BRJ'],['txt','F4OWBD79P86FYRR']]) {
      const r=await fetch(`/api/v1/files/${id}/content`,{credentials:'include'});
      const buf=await r.arrayBuffer();
      const h=await crypto.subtle.digest('SHA-256', buf);
      out[k]={status:r.status, ct:r.headers.get('content-type'), cd:r.headers.get('content-disposition'),
        bytes:buf.byteLength, sha:[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,64),
        head:[...new Uint8Array(buf.slice(0,8))].map(b=>b.toString(16).padStart(2,'0')).join(' ')};
    }
    return out;
  });
};
