import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QEF1XTURESO01'; const mid=process.env.QA_MID;
  const out={};
  const scan = async (label) => {
    await page.waitForTimeout(3500);
    await page.evaluate(DOM);
    const r = await page.evaluate(()=>{
      const q=window.__qa; const m=document.querySelector('main')||document.body;
      const t=(m.innerText||'');
      // every visible leaf carrying a star glyph or rating word
      const hits=[...m.querySelectorAll('*')].filter(n=>!n.children.length && q.boxVis(n))
        .map(n=>(n.textContent||'').trim()).filter(s=>/★|☆|rating|rate|quality|оцен/i.test(s));
      const svgTitles=[...m.querySelectorAll('svg')].filter(q.boxVis).map(s=>(s.getAttribute('aria-label')||s.querySelector('title')?.textContent||'')).filter(Boolean);
      return {textLen:t.length, hits:[...new Set(hits)].slice(0,20), svgTitles:[...new Set(svgTitles)].slice(0,20),
              full:t.replace(/\s+/g,' ').slice(0,1200)};
    });
    out[label]=r;
  };
  for (const tab of ['recording','chat','logs']) {
    await page.goto(`https://airion-cargo.store/w/${WS}/calls/${mid}?tab=${tab}`, {waitUntil:'domcontentloaded'});
    await scan('detail_'+tab);
  }
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await scan('hub');
  return out;
};
