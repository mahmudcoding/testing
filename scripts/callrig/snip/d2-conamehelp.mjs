const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(`(() => { const vis=(${VIS});
    const m=document.querySelector('main'); const i=(m.innerText||'').lastIndexOf('\\u203a');
    return ((i>=0?(m.innerText||'').slice(i+1):(m.innerText||'')).replace(/\\n+/g,' | ')).slice(0,300); })()`);
  const el = (await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main input')].filter(vis).find(e=>{ let p=e.parentElement;
      for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1 && /Company name/i.test(p.innerText||'')) return true; p=p.parentElement; } return false; }); })()`)).asElement();
  const orig = await el.inputValue();
  await el.scrollIntoViewIfNeeded(); await el.fill('Q'); await page.waitForTimeout(1500);
  const afterShort = await page.evaluate(`(() => { const vis=(${VIS});
    const m=document.querySelector('main'); const i=(m.innerText||'').lastIndexOf('\\u203a');
    return ((i>=0?(m.innerText||'').slice(i+1):(m.innerText||'')).replace(/\\n+/g,' | ')).slice(0,300); })()`);
  const aria = await el.evaluate(e=>({ invalid:e.getAttribute('aria-invalid'), desc:e.getAttribute('aria-describedby'),
                                       minlength:e.getAttribute('minlength'), maxlength:e.getAttribute('maxlength') }));
  await el.fill(orig); await page.waitForTimeout(800);
  return { contentBefore: before, contentWithShortName: afterShort,
           newText: afterShort.split(' | ').filter(t=>!before.includes(t)), inputAttrs: aria };
};
