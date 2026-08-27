export default async ({page}) => {
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={landed:page.url()};
  out.trigger = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const b=[...document.querySelectorAll('button,a')].filter(vis)
      .find(e=>/notification/i.test((e.getAttribute('aria-label')||e.innerText||'')));
    if(!b) return null;
    b.scrollIntoView({block:'center'}); b.click();
    return (b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,50);
  });
  await page.waitForTimeout(3500);
  out.panel = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n);
        if(c.display==='none'||c.visibility==='hidden')return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;} return o>0.01;};
    const cands=[...document.querySelectorAll('[role=dialog],[role=menu],aside,section,div')].filter(vis)
      .filter(e=>/invit/i.test(e.innerText||'') && (e.innerText||'').length<900);
    const el=cands[cands.length-1];
    if(!el) return null;
    return {txt:(el.innerText||'').replace(/\s+/g,' ').slice(0,400),
      controls:[...el.querySelectorAll('button,a,[role=button],[role=menuitem]')].filter(vis)
        .map(b=>`${b.tagName.toLowerCase()}${b.disabled?'(dis)':''}: ${((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim().slice(0,40)}`)};
  });
  out.pageWideActions = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    return [...document.querySelectorAll('button,a,[role=button]')].filter(vis)
      .map(e=>((e.getAttribute('aria-label')||e.innerText)||'').replace(/\s+/g,' ').trim())
      .filter(t=>/accept|decline|join|invit/i.test(t)).slice(0,12);
  });
  return out;
};
