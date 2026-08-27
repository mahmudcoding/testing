const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const WHERE = `(() => { const vis=(VISFN);
  const ae=document.activeElement;
  const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  return { tag: ae? ae.tagName.toLowerCase():null,
           label: ae? ((ae.innerText||ae.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,26)):null,
           insideDialog: !!(dlg && ae && dlg.contains(ae)),
           dialogOpen: !!dlg }; })()`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const where = WHERE.replace('VISFN', VIS);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const out={};
  // focus the trigger via keyboard-ish: click it, then inspect
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>(x.innerText||'').trim()==='QA Fixtures D')[0];
    if(b){ b.focus(); b.click(); } })()`);
  await page.waitForTimeout(1600);
  out.rightAfterOpen = await page.evaluate(where);
  const seq=[];
  for (let i=0;i<6;i++){ await page.keyboard.press('Tab'); await page.waitForTimeout(250);
    seq.push(await page.evaluate(where)); }
  out.tabSequence = seq.map(s=>`${s.insideDialog?'in':'OUT'}:${s.label||s.tag}`);
  out.everLeftDialog = seq.some(s=>s.dialogOpen && !s.insideDialog);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  out.afterEscape = await page.evaluate(where);
  return out;
};
