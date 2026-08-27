import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return{s:x.status,b}};
    const from=new Date(Date.now()-86400000).toISOString(), to=new Date(Date.now()+3*86400000).toISOString();
    const r=await g(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${from}&to=${to}`);
    const arr=r.b?.meetings||r.b?.data||(Array.isArray(r.b)?r.b:[]);
    const mine=(Array.isArray(arr)?arr:[]).filter(m=>/QA-E (pwd|allday)/.test(m.title||''));
    const detail=[];
    for(const m of mine.slice(0,3)){
      const d=await g(`/api/v1/calendar/meetings/${m.id}`);
      const body=d.b?.meeting||d.b||{};
      detail.push({title:m.title, status:d.s,
        passwordKeys:Object.keys(body).filter(k=>/pass|pwd|protect/i.test(k)),
        passwordValueLeaked: JSON.stringify(body).includes('probe-pw-1234'),
        hasPasswordFlag: body.has_password ?? body.password_protected ?? body.password ?? 'ABSENT',
        starts:body.starts_at, ends:body.ends_at});
    }
    return {found:mine.length, detail};
  }, WS);
};
