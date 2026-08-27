const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const ENUM = `() => { const vis = (${VIS});
  const main = document.querySelector('main')||document.body;
  const items = [...main.querySelectorAll('a,button,input,select,textarea,[role=switch],[role=combobox],[role=radio],[role=button]')].filter(vis)
    .map(e => { let lbl = e.getAttribute('aria-label')||'';
      if (!lbl) { let p=e.parentElement; for(let i=0;i<4&&p;i++){ if(p.querySelectorAll('a,button,input,select,[role=switch],[role=combobox]').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<90){lbl=t.replace(/\\n/g,' | ');break;} } p=p.parentElement; } }
      if (!lbl) lbl=(e.innerText||'').trim();
      return { tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'', label:lbl.slice(0,72),
               href:(e.getAttribute('href')||'').slice(0,48), checked:e.getAttribute('aria-checked') }; });
  const txt=(main.innerText||''); const i=txt.lastIndexOf('›');
  return { count: items.length, items: items.slice(0,26), content: (i>=0?txt.slice(i+1):txt).replace(/\\n+/g,' | ').trim().slice(0,340) }; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01'; const out={};
  for (const [name, path] of [['privacy', `/w/${W}/settings/privacy`], ['sessions', `/w/${W}/settings/sessions`], ['company-create', '/company/create']]) {
    try {
      await page.goto('https://airion-cargo.store' + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      out[name] = { url: page.url().replace(/^https?:\/\/[^/]+/,''), ...(await page.evaluate(`(${ENUM})()`)) };
    } catch (e) { out[name] = { err: e.message.slice(0,80) }; }
  }
  return out;
};
