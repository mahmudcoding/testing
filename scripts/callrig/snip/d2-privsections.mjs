export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    const walk=document.createTreeWalker(main, NodeFilter.SHOW_ELEMENT);
    const seq=[]; let n;
    while ((n=walk.nextNode())) {
      if (!vis(n)) continue;
      if (/^H[1-4]$/.test(n.tagName)) { const t=(n.innerText||'').trim().replace(/\s+/g,' '); if(t&&t.length<60) seq.push({k:'H',v:t}); }
      else if (n.matches('button,input,select,[role=switch],[role=combobox]')) {
        const l=(n.getAttribute('aria-label')||n.innerText||n.placeholder||'').trim().replace(/\s+/g,' ').slice(0,40);
        seq.push({k:'C',v:(n.getAttribute('role')||n.tagName.toLowerCase())+':'+(l||'(unlabelled)')});
      }
    }
    // collapse into sections
    const secs=[]; let cur=null;
    for (const s of seq) { if (s.k==='H'){ cur={heading:s.v, controls:[]}; secs.push(cur); } else if (cur) cur.controls.push(s.v); }
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const mi=all.indexOf('Messaging & invitations');
    return { sections: secs.map(s=>({heading:s.heading, n:s.controls.length, controls:[...new Set(s.controls)].slice(0,6)})),
      messagingText: mi>=0 ? all.slice(mi, mi+260) : '(heading not in text)' };
  });
};
