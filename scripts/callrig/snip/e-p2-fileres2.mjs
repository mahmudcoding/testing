import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return{s:x.status,b}};
    const r=await g(`/api/v1/users/me/files?workspace_id=${ws}`);
    const arr=r.b?.files||r.b?.data||[];
    const pick=(Array.isArray(arr)?arr:[]).filter(f=>/\.(png|jpg)$/i.test(f.name||f.filename||''));
    const out=[];
    for(const f of pick.slice(0,4)){
      const id=f.id;
      const c=await fetch(`/api/v1/files/${id}/content`,{credentials:'include'});
      const buf=new Uint8Array(await c.arrayBuffer());
      const magic=[...buf.slice(0,8)].map(b=>b.toString(16).padStart(2,'0')).join(' ');
      const isPNG = buf[0]===0x89 && buf[1]===0x50 && buf[2]===0x4e && buf[3]===0x47;
      out.push({name:f.name||f.filename, size:buf.length, contentType:c.headers.get('content-type'),
        declaredMime:f.mime_type||f.content_type||null, magic, isRealPNG:isPNG,
        firstBytesAsText: new TextDecoder().decode(buf.slice(0,24)).replace(/[^\x20-\x7e]/g,'.')});
    }
    return out;
  }, WS);
};
