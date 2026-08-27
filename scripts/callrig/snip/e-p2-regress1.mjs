import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // ALK-2884: the meeting created earlier with Public + Password — what did it save?
  out.alk2884 = await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return{s:x.status,b}};
    const from=new Date(Date.now()-86400000).toISOString(), to=new Date(Date.now()+3*86400000).toISOString();
    const r=await g(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${from}&to=${to}`);
    const arr=r.b?.meetings||r.b?.data||[];
    const m=(Array.isArray(arr)?arr:[]).find(x=>/QA-E pwd probe/.test(x.title||''));
    if(!m) return {notFound:true};
    const d=await g(`/api/v1/calendar/meetings/${m.id}`);
    const body=d.b?.meeting||d.b||{};
    return {title:m.title, has_password:body.has_password,
      is_private:body.is_private, access:body.access||body.visibility||null,
      requires_approval:body.requires_approval,
      accessKeys:Object.keys(body).filter(k=>/privat|access|visib|approv|password/i.test(k))};
  }, WS);
  return out;
};
