const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const navs = await page.evaluate(`(() => { const vis = ${VIS};
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a => ({ label: a.innerText.trim().slice(0,26), href: a.getAttribute('href') }))
      .filter((v,i,arr) => arr.findIndex(x=>x.href===v.href)===i); })()`);
  const want = navs.filter(n => /appearance|about|call|audio|notification/i.test(n.label + n.href));
  const out = [];
  for (const n of want) {
    try {
      await page.goto('https://airion-cargo.store' + n.href, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2200);
      const r = await page.evaluate(`(() => { const vis = ${VIS};
        const main = document.querySelector('main')||document.body;
        const heads = [...main.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h=>h.innerText.trim().slice(0,44));
        const ctrls = [...main.querySelectorAll('input,select,textarea,button,[role=switch],[role=radio],[role=combobox]')].filter(vis)
          .map(e => { let lbl = e.getAttribute('aria-label')||'';
            if (!lbl && e.id) { const l=document.querySelector('label[for="'+CSS.escape(e.id)+'"]'); if(l) lbl=l.innerText.trim(); }
            if (!lbl) { let p=e.parentElement; for(let i=0;i<4&&p;i++){ if(p.querySelectorAll('input,select,textarea,button,[role=switch]').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<80){lbl=t.replace(/\\n/g,' | ');break;} } p=p.parentElement; } }
            if (!lbl) lbl = (e.innerText||'').trim();
            return { t:e.tagName.toLowerCase(), role:e.getAttribute('role')||'', lbl:lbl.slice(0,74),
                     checked:e.getAttribute('aria-checked'), dis:e.disabled===true||e.getAttribute('aria-disabled')==='true' }; });
        const notYet = (main.innerText||'').match(/not available yet|coming soon|not yet supported/gi) || [];
        return { heads, n: ctrls.length, ctrls: ctrls.slice(0,26), notYetCount: notYet.length }; })()`);
      out.push({ page: n.label, href: n.href, ...r });
    } catch (e) { out.push({ page: n.label, href: n.href, err: e.message.slice(0,70) }); }
  }
  return out;
};
