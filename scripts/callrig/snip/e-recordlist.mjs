import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QEF1XTURESO01'; const mid=process.env.QA_MID;
  const out={dl:null,reqs:[]};
  page.on('download', d=>{ out.dl={name:d.suggestedFilename(), url:d.url().slice(0,200)}; });
  page.on('request', r=>{ const u=r.url(); if(/recording|\.mp4|download/i.test(u)) out.reqs.push(r.method()+' '+u.replace(/^https?:\/\/[^/]+/,'').slice(0,150)); });
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${mid}?tab=recording`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.evaluate(DOM);
  out.rows = await page.evaluate(()=>{
    const q=window.__qa; const m=document.querySelector('main');
    return [...m.querySelectorAll('li,button,[role=option],a')].filter(q.vis)
      .map(n=>({tag:n.tagName, name:q.nameOf(n).replace(/\s+/g,' ').slice(0,80), t:n.getAttribute('data-testid'),
                sel:n.getAttribute('aria-selected')||n.getAttribute('data-active')}))
      .filter(x=>/Ready|Recording|Download|Share|recording/i.test(x.name));
  });
  out.video = await page.evaluate(()=>{
    const v=document.querySelector('video');
    return v?{src:(v.currentSrc||v.src||'').slice(0,120), dur:v.duration, w:v.videoWidth,h:v.videoHeight}:null;
  });
  out.reqs=[];
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Download/i));
  await page.waitForTimeout(7000);
  out.reqs=[...new Set(out.reqs)];
  await page.evaluate(DOM).catch(()=>{});
  out.notices = await page.evaluate(()=>window.__qa.notices().map(n=>n.text)).catch(()=>[]);
  return out;
};
