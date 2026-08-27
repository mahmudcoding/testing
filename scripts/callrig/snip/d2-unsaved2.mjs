const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const [tag, path, idx] of [['profile','profile',0], ['account','account',0]]) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    const before = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      return { mentionsUnsaved:/unsaved/i.test(t) }; })()`);
    await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const i=[...main.querySelectorAll('input')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)[${idx}];
      i.focus(); const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(i, (i.value||'')+'X'); i.dispatchEvent(new Event('input',{bubbles:true}));
      i.dispatchEvent(new Event('change',{bubbles:true})); })()`);
    await page.waitForTimeout(1400);
    out[tag] = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const m=t.match(/[^.]{0,40}unsaved[^.]{0,40}/i);
      return { unsavedText: m?m[0].trim():'(none)',
        bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(x=>/^(Save|Discard)/.test(x)),
        beforeHadUnsaved:${JSON.stringify(0)} }; })()`);
    out[tag].beforeMentionedUnsaved = before.mentionsUnsaved;
    // discard so nothing lingers
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Discard$/.test((x.innerText||'').trim()));
      if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(1200);
  }
  return out;
};
