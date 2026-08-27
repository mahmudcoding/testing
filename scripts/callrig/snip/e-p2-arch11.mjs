import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const co = me?.user?.company_id || me?.company_id || me?.user?.company?.id;
    const g = async (q,extra='') => {
      const u=`/api/v1/search?q=${encodeURIComponent(q)}&company_id=${co}&workspace_id=${ws}${extra}`;
      const x=await fetch(u,{credentials:'include'}); let b=null; try{b=await x.json()}catch{}
      const m=b?.messages||b?.results?.messages||[];
      return {q, extra, s:x.status, total:b?.total_messages??null,
              n:Array.isArray(m)?m.length:null,
              chans:[...new Set((Array.isArray(m)?m:[]).map(r=>r.channel_id||r.channel?.id))],
              err: x.status>=400 ? JSON.stringify(b).slice(0,200) : null};
    };
    return {company: co? 'resolved':'MISSING',
      archived_default:  await g('archive notification probe'),
      archived_included: await g('archive notification probe','&include_archived=true'),
      control:           await g('unread badge probe')};
  }, WS);
};
