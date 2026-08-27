const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const out={};
  const state = () => page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main');
    const combos=[...main.querySelectorAll('[role=combobox]')].filter(vis).map(c=>(c.innerText||'').trim().slice(0,26));
    const btn=[...main.querySelectorAll('button')].filter(vis).find(b=>/Create invite link/.test(b.innerText||''));
    const uses=[...main.querySelectorAll('input')].filter(vis).map(e=>String(e.value)).slice(0,4);
    return { combos, createDisabled: btn?btn.disabled:null, inputValues: uses }; })()`);
  out.initial = await state();
  const combo = page.locator('main [role=combobox]').first();
  await combo.scrollIntoViewIfNeeded(); await combo.click(); await page.waitForTimeout(1600);
  out.options = await page.evaluate(`(() => { const vis=(${VIS});
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
    if(!w) return '(no popper)';
    return [...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0)
      .map(e=>(e.innerText||'').trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i); })()`);
  out.pick = await page.evaluate(`(() => { const vis=(${VIS});
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
    if(!w) return 'no popper';
    const el=[...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0).find(e=>/^Member\\b.*Workspace role/.test((e.innerText||'').trim()));
    if(!el) return 'Member not found'; el.click(); return 'clicked'; })()`);
  await page.waitForTimeout(1500);
  out.afterRolePick = await state();
  // fill Maximum uses if the button is still disabled
  if (out.afterRolePick.createDisabled) {
    const inp = page.locator('main input').filter({ hasNot: page.locator('[placeholder="Filter settings"]') });
    const h = await page.evaluateHandle(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('main input')].filter(vis).find(e => { let p=e.parentElement;
        for(let i=0;i<4&&p;i++){ if(/Maximum uses/.test(p.innerText||'')) return true; p=p.parentElement; } return false; }); })()`);
    const el2 = h.asElement();
    if (el2) { await el2.scrollIntoViewIfNeeded(); await el2.fill('5'); await page.waitForTimeout(1200); out.filledMaxUses = true; }
  }
  await page.waitForTimeout(1600);
  out.afterPick = await state();
  return out;
};
