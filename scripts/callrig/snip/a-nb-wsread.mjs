export default async ({page}) => {
  const rx = new RegExp(process.env.QA_RX || 'pin', 'i');
  return await page.evaluate((r)=>{ const re=new RegExp(r,'i');
    const l = window.__wsLog||[];
    const first = l.length?l[0].t:0;
    return {hooked:!!window.__wsHooked, total:l.length, firstAt:first, lastAt:l.length?l[l.length-1].t:0,
      types:[...new Set(l.filter(x=>x.d!=='<binary>').map(x=>{try{return (JSON.parse(x.d).type)||'?';}catch(e){return '?';}}))].slice(0,20),
      hits: l.filter(x=>x.d!=='<binary>' && re.test(x.d)).map(x=>({ms:x.t-first, at:x.t, dir:x.dir, d:x.d.slice(0,160)})).slice(0,60)};
  }, rx.source);
};
