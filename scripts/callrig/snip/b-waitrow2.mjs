export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWAZJ5MTHSO98';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.panelOpenBefore = await page.evaluate(()=>!!document.querySelector('button[aria-label="Close participants"]'));
  if (!out.panelOpenBefore) {
    await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Participants'); if(b) b.click(); });
    await page.waitForTimeout(2500);
  }
  out.panelOpenNow = await page.evaluate(()=>!!document.querySelector('button[aria-label="Close participants"]'));
  const t = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' '));
  out.waiting = (t.match(/WAITING.{0,200}/i)||[])[0]||null;
  out.inCall = (t.match(/\d+ in call.{0,120}/i)||[])[0]||null;
  out.admitBtns = await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(a=>a&&/admit|deny/i.test(a)).slice(0,6));
  out.hasXXXX = /XXXX/.test(t);
  out.clip = await page.evaluate(()=>{
    const res=[];
    document.querySelectorAll('*').forEach(el=>{ if(el.children.length) return;
      const txt=(el.innerText||'').trim(); if(!txt.includes('XXXX')) return;
      const r=el.getBoundingClientRect();
      res.push({tag:el.tagName, len:txt.length, scrollW:el.scrollWidth, clientW:el.clientWidth, clipped:el.scrollWidth>el.clientWidth, right:Math.round(r.right), innerW:innerWidth});
    });
    return res.slice(0,5);
  });
  return out;
};
