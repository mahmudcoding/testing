const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const STATE = `(() => { const vis=(VISFN);
  const main=document.querySelector('main')||document.body;
  const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>(x.innerText||'').trim()==='English')[0];
  const containers=[...document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],[data-state=open],[data-radix-popper-content-wrapper]')]
    .filter(vis).map(c=>({ role:c.getAttribute('role')||c.tagName.toLowerCase(),
      text:(c.innerText||'').replace(/\\s+/g,' ').trim().slice(0,160) }));
  return { buttonFound: !!b,
           ariaExpanded: b? b.getAttribute('aria-expanded') : null,
           ariaHasPopup: b? b.getAttribute('aria-haspopup') : null,
           openContainers: containers,
           bodyMentions: ['Русский','Ўзбек','O\\u2018zbek','Uzbek','Russian','English']
             .filter(w=>document.body.innerText.includes(w)) };
})()`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const st = STATE.replace('VISFN', VIS);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const before = await page.evaluate(st);
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>(x.innerText||'').trim()==='English')[0];
    if(b) b.click(); })()`);
  await page.waitForTimeout(1400);
  const after = await page.evaluate(st);
  await page.keyboard.press('Escape');
  return { before, after };
};
