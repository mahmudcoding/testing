import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const co = me?.company_id || me?.user?.company_id || me?.data?.company_id;
    const g = async q => {
      const x=await fetch(`/api/v1/search?q=${encodeURIComponent(q)}&company_id=${co}&workspace_id=${ws}&limit=25`,{credentials:'include'});
      let b=null; try{b=await x.json()}catch{}
      return {q, s:x.status, keys: b?Object.keys(b):[],
        counts:{ messages: (b?.messages||[]).length, channels:(b?.channels||[]).length,
                 users:(b?.users||b?.people||[]).length, files:(b?.files||[]).length },
        totals: Object.fromEntries(Object.entries(b||{}).filter(([k])=>/^total/.test(k))),
        chanNames: (b?.channels||[]).map(c=>c.name||c.id) };
    };
    return {companyResolved: !!co,
      general: await g('qa-general'), archived: await g('qa-archived'),
      probe: await g('e-arch-probe'), bare: await g('qa')};
  }, WS);
};
