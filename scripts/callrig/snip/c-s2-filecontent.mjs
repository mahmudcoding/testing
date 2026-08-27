export default async ({page}) => {
  const ch='C4QCPRIVATE0001';
  return page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=40`,{credentials:'include'})).json();
    const ms=j.messages||j.data||j||[];
    const withFiles=ms.filter(m=>(m.files||[]).length);
    const out=[];
    for (const m of withFiles.slice(0,3)){
      for (const f of m.files.slice(0,2)){
        const url=f.preview_url || `/api/v1/files/${f.id}/content`;
        try{
          const r=await fetch(url,{credentials:'include'});
          const buf=await r.arrayBuffer();
          out.push({filename:f.filename, mime:f.mime_type, declaredSize:f.size,
            url:url.replace(f.id,'<id>'), status:r.status,
            contentType:r.headers.get('content-type'),
            bytes:buf.byteLength, sizeMatches: buf.byteLength===f.size});
        }catch(e){ out.push({filename:f.filename, err:String(e).slice(0,50)}); }
      }
    }
    return out;
  }, ch);
};
