export default async ({page}) => {
  const r={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const all = await page.$$('main button');
  const lab = await Promise.all(all.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const i = lab.findIndex(t=>/^Join$/i.test(t));
  if (i<0) return {err:'no join', lab: lab.filter(Boolean).slice(0,20)};
  await all[i].click();
  await page.waitForTimeout(5000);
  // prejoin: open microphone selector
  const btns = await page.$$('button');
  const labels = await Promise.all(btns.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const mi = labels.findIndex(t=>/Microphone|Микрофон/i.test(t) && !/Test/i.test(t));
  r.prejoinControls = labels.filter(Boolean).slice(-14);
  if (mi>=0){ await btns[mi].click(); await page.waitForTimeout(2200);
    r.menu = await page.evaluate(()=>{const m=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')].pop();
      return m? [...m.querySelectorAll('button,[role="option"],[role="menuitem"],[role="menuitemradio"]')].map(b=>({t:(b.textContent||'').trim().slice(0,30), checked:b.getAttribute('aria-checked'), state:b.getAttribute('data-state')})):'no menu';});
    const m=[...(await page.$$('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]'))].pop();
    if (m) for (const it of await m.$$('button,[role="option"],[role="menuitem"],[role="menuitemradio"]')) {
      const t=(await it.innerText()).trim(); if (/Fake Audio Input 2/i.test(t)) { await it.click(); r.picked=t.replace(/\n/g,' '); break; } }
  }
  await page.waitForTimeout(2500);
  // join
  const b2 = await page.$$('button');
  const l2 = await Promise.all(b2.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const j = l2.findIndex(t=>/^(Join|Присоединиться)$/i.test(t));
  if (j>=0){ await b2[j].click(); await page.waitForTimeout(9000); }
  r.senderTracks = await page.evaluate(()=>{const out=[]; (window.__pcs||[]).forEach(pc=>{ if(pc.connectionState!=='closed') pc.getSenders().forEach(s=>{ if(s.track) out.push(s.track.label+' | dev '+((s.track.getSettings().deviceId||'').slice(0,12))); }); }); return out;});
  r.gum = await page.evaluate(()=>(window.__gumCalls||[]).map(c=>c.c.slice(0,120)));
  return r;
};
