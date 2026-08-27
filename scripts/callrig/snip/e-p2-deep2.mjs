import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const t = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QEGENERAL0001/messages?limit=100',{credentials:'include'});
    const b=await r.json(); const a=b.messages||b.data||[]; const arr=Array.isArray(a)?a:[];
    const oldest=arr[arr.length-1], newest=arr[0];
    return {oldestId:oldest.id, oldestBody:(oldest.body||'').slice(0,36),
            newestBody:(newest.body||'').slice(0,36), n:arr.length};
  });
  // start polling BEFORE navigation completes settling
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001?m=${t.oldestId}`, {waitUntil:'commit'});
  const samples=[];
  for (let i=0;i<26;i++){
    const s=await page.evaluate((id)=>{
      const el=document.querySelector(`[data-message-id="${id}"]`);
      if(!el) return null;
      const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
      const others=[...document.querySelectorAll('[data-message-id]')].filter(x=>x!==el);
      const nb=others.length?getComputedStyle(others[Math.floor(others.length/2)]):null;
      return {top:Math.round(r.top), inView:r.top>=0&&r.bottom<=innerHeight,
        bg:cs.backgroundColor, nbBg:nb?nb.backgroundColor:null,
        differs: !!nb && (cs.backgroundColor!==nb.backgroundColor||cs.boxShadow!==nb.boxShadow||cs.outlineStyle!==nb.outlineStyle)};
    }, t.oldestId).catch(()=>null);
    if(s) samples.push({t:i*300, ...s});
    await page.waitForTimeout(300);
  }
  const highlighted=samples.filter(s=>s.differs);
  return {target:t, firstSampleAt: samples.length?samples[0].t:null, sampleCount:samples.length,
    everHighlighted: highlighted.length>0,
    highlightWindow: highlighted.length? [highlighted[0].t, highlighted[highlighted.length-1].t]:null,
    highlightBg: highlighted.length? highlighted[0].bg:null, neighbourBg: samples.length?samples[0].nbBg:null,
    everInView: samples.some(s=>s.inView),
    firstTop: samples.length?samples[0].top:null, lastTop: samples.length?samples[samples.length-1].top:null};
};
