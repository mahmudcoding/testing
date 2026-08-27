const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const api = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const a=Array.isArray(j)?j:((j&&(j.sessions||j.items))||[]); return { status:r.status, count:a.length };})()`);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const inContent = e => e.getBoundingClientRect().left > 300;
    const wide=[...main.querySelectorAll('button,a[href],input,select,textarea,summary,details,[role=switch],[role=button],[role=link],[role=tab],[role=menuitem],[role=combobox],[tabindex]')]
      .filter(vis).filter(inContent)
      .map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'', ti:e.getAttribute('tabindex'),
                 text:(e.innerText||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,36),
                 dis:e.disabled===true }));
    const narrow=[...main.querySelectorAll('button,a[href],input,select,textarea,[role=switch],[role=combobox],[role=radio],[role=button]')]
      .filter(vis).filter(inContent).length;
    return { wideCount:wide.length, narrowCount:narrow, wide }; })()`);
  return { api, ui };
};
