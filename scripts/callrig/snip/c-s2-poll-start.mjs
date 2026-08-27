export default async ({page}) => {
  await page.evaluate(()=>{
    window.__np={s:[],t0:Date.now()};
    clearInterval(window.__npId);
    window.__npId=setInterval(async()=>{
      try{ const j=await (await fetch('/api/v1/notifications?limit=2',{credentials:'include'})).json();
        const a=j.notifications||j.data||j||[];
        window.__np.s.push({t:Math.round((Date.now()-window.__np.t0)/1000), total:j.total,
          top:a[0]?{type:a[0].type,title:a[0].title,body:(a[0].body||'').slice(0,34)}:null,
          vis:document.visibilityState});
      }catch(e){ window.__np.s.push({err:String(e).slice(0,30)}); }
    },1000);
  });
  return {started:true};
};
