export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', parent='M4OX2S2JDLOFCMP';
  const out={cases:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const ids=await page.evaluate(async(parent)=>{
    const r=await fetch(`/api/v1/messaging/messages/${parent}/thread?limit=100`,{credentials:'include'});
    const j=await r.json(); const reps=j.replies||[];
    const pick=(n)=>{const h=reps.find(m=>new RegExp('QA-S2-BT2-'+n).test(m.body||''));
      return h?{id:h.id, n}:null;};
    return [pick('001'), pick('070'), pick('140')].filter(Boolean);}, parent);
  out.ids=ids;
  for(const t of ids){
    await page.goto('about:blank'); await page.waitForTimeout(700);
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?m=${t.id}&thread=${parent}`);
    const marks=[];
    for(let i=0;i<18;i++){
      await page.waitForTimeout(1000);
      marks.push(await page.evaluate((id)=>{
        const el=document.querySelector(`[data-message-id="${id}"]`);
        if(!el) return {present:false};
        const r=el.getBoundingClientRect();
        return {present:true, top:Math.round(r.top), vh:innerHeight,
          inView:r.top>=-4&&r.bottom<=innerHeight+4};}, t.id));
      const l=marks[marks.length-1]; if(l.present&&l.inView&&i>=2) break;
    }
    const f=marks[marks.length-1];
    out.cases.push({reply:t.n, waitedSec:marks.length, everPresent:marks.some(m=>m.present),
      everInView:marks.some(m=>m.inView), finalTop:f.top===undefined?null:f.top, vh:f.vh});
  }
  return out;
};
