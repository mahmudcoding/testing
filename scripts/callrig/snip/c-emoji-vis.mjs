export default async ({page}) => {
  const WS='W4QCF1XTURESO01';
  // assume we are already on the channel with the picker closed; reopen
  const chans = await page.evaluate(async (ws) => {
    const r = await fetch(`/api/v1/workspaces/${ws}/channels`, {credentials:'include'});
    const j = await r.json(); const list = Array.isArray(j)?j:(j.channels||j.items||[]);
    return list.map(c=>({id:c.id,name:c.name}));
  }, WS);
  const gen = chans.find(c=>/general/.test(c.name));
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${gen.id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const msgs = await page.$$('[data-message-id]');
  await msgs[msgs.length-1].hover();
  await page.waitForTimeout(800);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent && /add reaction|react/i.test(b.getAttribute('aria-label')||'')); if(b) b.click(); });
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const inp = [...document.querySelectorAll('input')].find(i=>/emoji/i.test(i.placeholder||i.getAttribute('aria-label')||''));
    const root = inp ? inp.parentElement : document.body;
    const btns = [...root.querySelectorAll('button')];
    const info = (b) => {
      const r=b.getBoundingClientRect(); const cx=r.x+r.width/2, cy=r.y+r.height/2;
      let a=b, op=1, hidden=null, zeroH=false;
      while(a){ const cs=getComputedStyle(a); op=Math.min(op, parseFloat(cs.opacity));
        if(a.getAttribute && a.getAttribute('aria-hidden')==='true') hidden='aria-hidden@'+a.tagName+(a.className?('.'+String(a.className).slice(0,30)):'');
        if(a!==b && a.getBoundingClientRect().height===0) zeroH=true;
        a=a.parentElement; }
      const hit = document.elementFromPoint(cx,cy);
      return {txt:b.textContent.trim(), al:b.getAttribute('aria-label'),
        rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
        opacity:op, ancestorAriaHidden:hidden, zeroHeightAncestor:zeroH,
        hitIsSelf: hit===b||b.contains(hit), hitTag: hit?hit.tagName+'.'+String(hit.className).slice(0,25):null,
        parentClass: String(b.parentElement?.className||'').slice(0,90),
        grandParentAL: b.parentElement?.parentElement?.getAttribute('aria-label')||null,
        grandParentTag: b.parentElement?.parentElement?.tagName||null};
    };
    return {
      pickerRootClass: String(root.className||'').slice(0,120),
      structure: [...root.children].map(c=>({tag:c.tagName, cls:String(c.className||'').slice(0,70), al:c.getAttribute('aria-label'), h:Math.round(c.getBoundingClientRect().height)})),
      first10: btns.slice(0,10).map(info)
    };
  });
};
