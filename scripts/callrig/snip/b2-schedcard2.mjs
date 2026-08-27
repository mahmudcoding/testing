export default async ({ page }) => {
  const title = process.env.QA_TITLE || 'QA sched start';
  return await page.evaluate(t => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    // walk up from the text node's element until we find buttons
    const cand = [...document.querySelectorAll('*')].filter(v)
      .filter(e=>(e.innerText||'').includes(t) && (e.innerText||'').length < 400);
    let node = cand[cand.length-1], found = null;
    for (let i=0; i<8 && node; i++) {
      const btns = [...node.querySelectorAll('button')].filter(v);
      if (btns.length) { found = { hops:i, text: node.innerText.replace(/\n+/g,' | ').slice(0,200),
        buttons: btns.map(b=>({ t:(b.innerText||'').trim().slice(0,22),
                                al:(b.getAttribute('aria-label')||'').slice(0,22), disabled:b.disabled })) }; break; }
      node = node.parentElement;
    }
    return found || { none: true };
  }, title);
};
