export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(5000);
  await page.evaluate((ws)=>{
    window.__ur={s:[],t0:Date.now()};
    clearInterval(window.__urId);
    window.__urId=setInterval(async()=>{
      try{
        const j=await (await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'})).json();
        const arr=(j.channels||j.data||j||[]);
        const g=(Array.isArray(arr)?arr:[]).find(c=>c.channel_id==='C4QCGENERAL0001');
        const badge=[...document.querySelectorAll('a[href*="C4QCGENERAL0001"]')]
          .map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,28))[0]||null;
        window.__ur.s.push({t:Math.round((Date.now()-window.__ur.t0)/1000),
          unread:g?g.unread_count:null, seq:g?g.last_message_seq:null, read:g?g.last_read_seq:null,
          badge, vis:document.visibilityState});
      }catch(e){ window.__ur.s.push({err:String(e).slice(0,30)}); }
    },1500);
  }, ws);
  return {parked:page.url()};
};
