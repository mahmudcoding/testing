const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  return await page.evaluate(`(() => { const vis=(${VIS});
    // every element that actually scrolls, not an assumption about which one
    const scrollers=[...document.querySelectorAll('*')].filter(e=>{
      const s=getComputedStyle(e);
      return e.scrollHeight - e.clientHeight > 40 && /auto|scroll/.test(s.overflowY) && vis(e);
    }).map(e=>({ tag:e.tagName.toLowerCase(), cls:(e.className||'').toString().slice(0,42),
                 scrollH:e.scrollHeight, clientH:e.clientHeight, top:e.scrollTop }));
    const inputs=[...document.querySelectorAll('input')].filter(vis).map(i=>({
      type:i.type, ph:i.placeholder||'', val:(i.value||'').slice(0,24),
      label:((i.closest('label')||{}).innerText||'').replace(/\\s+/g,' ').trim().slice(0,42),
      y:Math.round(i.getBoundingClientRect().top) }));
    const btns=[...document.querySelectorAll('button')].filter(vis).map(b=>({
      t:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,34),
      y:Math.round(b.getBoundingClientRect().top), disabled:b.disabled }));
    return { scrollers, inputs: inputs.slice(0,10), buttons: btns.slice(0,26),
             docScrolls: document.documentElement.scrollHeight > innerHeight };
  })()`);
};
