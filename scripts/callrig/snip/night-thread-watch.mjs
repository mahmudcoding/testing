export default async ({page}) => {
  const before = await page.evaluate(()=>({url:location.href, testids:[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(t=>/thread|chat/i.test(t)))]}));
  // install observer
  await page.evaluate(()=>{
    window.__tw=[]; window.__t0=Date.now();
    const snap=()=>JSON.stringify({url:location.href, ids:[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(t=>/thread|chat/i.test(t)))]});
    window.__last=snap();
    window.__tw_i=setInterval(()=>{const s=snap(); if(s!==window.__last){window.__tw.push({at:Date.now()-window.__t0, s:JSON.parse(s)}); window.__last=s;}},200);
  });
  const btns = await page.$$('aside button');
  let clicked=null, info=null;
  for (const b of btns) {
    const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if (/^Thread$/i.test(l)) {
      info = await b.evaluate(e=>({tag:e.tagName, cls:String(e.className).slice(0,80), testid:e.getAttribute('data-testid'), disabled:e.disabled, rect:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(e.getBoundingClientRect())}));
      await b.click(); clicked=l; break;
    }
  }
  await page.waitForTimeout(10000);
  const changes = await page.evaluate(()=>{clearInterval(window.__tw_i); return window.__tw;});
  const after = await page.evaluate(()=>({url:location.href, testids:[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(t=>/thread|chat/i.test(t)))]}));
  return {clicked, buttonInfo: info, before, changes, after};
};
