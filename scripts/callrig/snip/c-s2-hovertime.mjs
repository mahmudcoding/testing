export default async ({page}) => {
  const out={};
  const msgs=page.locator('main [data-message-id]');
  const n=await msgs.count();
  // find a grouped message: one whose visible <time> is absent
  const idx=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    for(let i=els.length-1;i>=0;i--){
      const t=els[i].querySelector('time');
      const r=t&&t.getBoundingClientRect();
      if(!t||!r||r.width<4) return i;
    }
    return -1;
  });
  out.idx=idx; out.total=n;
  if(idx<0) return out;
  const el=msgs.nth(idx);
  await el.scrollIntoViewIfNeeded();
  out.before = await el.evaluate(e=>{
    const t=e.querySelector('time'); const r=t&&t.getBoundingClientRect();
    return {hasTime:!!t, w:r?Math.round(r.width):0, txt:t?t.textContent.trim():null};
  });
  await el.hover();
  const samples=[];
  for(let i=0;i<6;i++){ await page.waitForTimeout(350);
    samples.push(await el.evaluate(e=>{
      const t=e.querySelector('time'); const r=t&&t.getBoundingClientRect();
      const anyTime=[...e.querySelectorAll('*')].filter(x=>x.children.length===0)
        .filter(x=>/^\d{1,2}:\d{2}/.test((x.textContent||'').trim()))
        .filter(x=>{const rr=x.getBoundingClientRect();return rr.width>8&&rr.height>6;})
        .map(x=>(x.textContent||'').trim());
      return {hasTime:!!t, w:r?Math.round(r.width):0, txt:t?t.textContent.trim():null, anyTime};
    }));
  }
  out.afterHover=samples.at(-1);
  out.everShown=samples.some(s=>s.w>4||s.anyTime.length);
  out.titleAttr = await el.evaluate(e=>{
    const withTitle=[...e.querySelectorAll('[title]')].map(x=>x.getAttribute('title')).slice(0,4);
    return withTitle;
  });
  return out;
};
