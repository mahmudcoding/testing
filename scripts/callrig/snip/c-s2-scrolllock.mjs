export default async ({page}) => {
  const out={};
  // container is already tagged from the previous snippet; re-tag if missing
  out.tag = await page.evaluate(()=>{
    let sc=document.querySelector('[data-qa-scroll="1"]');
    if(!sc){ for (const e of document.querySelectorAll('div')) {
      if (e.scrollHeight>e.clientHeight+40 && e.clientHeight>300 && e.querySelector('[data-message-id]')) { sc=e; sc.setAttribute('data-qa-scroll','1'); break; } } }
    if(!sc) return null;
    const r=sc.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), top:Math.round(sc.scrollTop), h:Math.round(sc.scrollHeight)};
  });
  if (!out.tag) return out;
  // install a high-frequency recorder of scrollTop
  await page.evaluate(()=>{
    const sc=document.querySelector('[data-qa-scroll="1"]');
    window.__sl={samples:[], t0:performance.now()};
    window.__slId=setInterval(()=>{ window.__sl.samples.push({t:Math.round(performance.now()-window.__sl.t0), top:Math.round(sc.scrollTop)}); }, 50);
    sc.addEventListener('scroll', ()=>{ window.__sl.samples.push({t:Math.round(performance.now()-window.__sl.t0), top:Math.round(sc.scrollTop), ev:1}); });
  });
  await page.mouse.move(out.tag.x, out.tag.y);
  await page.mouse.wheel(0, -900);
  await page.waitForTimeout(2500);
  // also try a direct assignment while recording
  await page.evaluate(()=>{ const sc=document.querySelector('[data-qa-scroll="1"]'); sc.scrollTop = 100; });
  await page.waitForTimeout(2500);
  out.trace = await page.evaluate(()=>{
    clearInterval(window.__slId);
    const s=window.__sl.samples;
    const changes=s.filter((x,i)=> i===0 || x.top!==s[i-1].top);
    return {samples:s.length, distinctTops:[...new Set(s.map(x=>x.top))].slice(0,10), changes:changes.slice(0,14)};
  });
  // topmost rendered message before/after, as a content check
  out.topMessage = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('[data-message-id]')];
    const first=els[0];
    return first? {id:first.getAttribute('data-message-id').slice(-6), text:first.innerText.replace(/\n+/g,' ').slice(0,40),
      y:Math.round(first.getBoundingClientRect().y)}:null;
  });
  return out;
};
