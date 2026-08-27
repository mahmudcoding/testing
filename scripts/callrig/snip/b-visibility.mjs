export default async ({page}) => {
  const url=process.env.QA_URL;
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate(()=>{
    const probe = (sel) => {
      const el=document.querySelector(sel);
      if(!el) return {sel, missing:true};
      const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      return {sel, phase:el.dataset?.phase??null, opacity:cs.opacity,
        h:Math.round(r.height), w:Math.round(r.width),
        inert: el.hasAttribute('inert'), ariaHidden: el.getAttribute('aria-hidden'),
        gridRows: cs.gridTemplateRows, overflow: cs.overflow};
    };
    // independent check: is the text actually hittable at its own coordinates?
    const hitTest = (re) => {
      const el=[...document.querySelectorAll('h3,p,button')].find(e=>re.test(e.innerText||'')&&(e.innerText||'').length<120);
      if(!el) return {missing:true};
      const r=el.getBoundingClientRect(); const cx=r.x+r.width/2, cy=r.y+r.height/2;
      const hit=document.elementFromPoint(cx,cy);
      let anc=el, opac=1, clipped=false;
      while(anc){ const cs=getComputedStyle(anc); opac=Math.min(opac, parseFloat(cs.opacity));
        if(anc.getBoundingClientRect().height===0 && anc.contains(el) && anc!==el) clipped=true;
        anc=anc.parentElement; }
      return {text:(el.innerText||'').replace(/\s+/g,' ').slice(0,44),
              rect:{y:Math.round(r.y),h:Math.round(r.height)},
              effectiveOpacity:opac, hasZeroHeightAncestor:clipped,
              hitIsSelf: hit===el||el.contains(hit), hitTag:hit?hit.tagName:null};
    };
    return {
      url: location.href.replace(/^https:\/\/[^/]+/,''),
      pinnedWrapper: probe('[data-testid="pinned-messages-transition"]'),
      onboardWrapper: probe('[data-testid="channel-onboarding-transition"]'),
      pinnedHit: hitTest(/no message text|View all \(/i),
      onboardHit: hitTest(/Start this channel|Add teammates/i)
    };
  });
};
