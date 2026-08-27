import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const n = Number(process.env.QA_N || 10);
  const out={clicks:[]};
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  const read = async () => await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>/^(Mute|Unmute)$/.test((x.getAttribute('aria-label')||'').trim()));
    const pcs=window.__pcs||[]; let en=null;
    for (const pc of pcs) { if(pc.connectionState==='closed') continue;
      for (const s of pc.getSenders()) if (s.track && s.track.kind==='audio') en=s.track.enabled; }
    return {label:b?b.getAttribute('aria-label'):null, trackEnabled:en}; }, VIS);
  out.before = await read();
  for (let i=0;i<n;i++){
    await page.evaluate((v)=>{ const vis=eval(v);
      const b=[...document.querySelectorAll('button')].filter(vis)
        .find(x=>/^(Mute|Unmute)$/.test((x.getAttribute('aria-label')||'').trim()));
      if(b) b.click(); }, VIS);
    await page.waitForTimeout(180);
    out.clicks.push((await read()).label);
  }
  await page.waitForTimeout(6000);
  out.settled = await read();
  return out;
};
