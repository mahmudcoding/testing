const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const PROBE = `(() => { const vis=(VISFN);
  const main=document.querySelector('main')||document.body;
  // the exact nodes the published finding names: the uppercase section labels
  const labels=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
    .filter(e=>/^(SETTINGS|ACCOUNT|WORKSPACE|ADMIN|MEMBERSHIP MANAGEMENT)$/.test((e.innerText||'').trim()));
  const info=labels.map(e=>{ const cs=getComputedStyle(e);
    let n=e,bg=null;
    while(n && n!==document.documentElement){ const c=getComputedStyle(n).backgroundColor;
      const m=(c||'').match(/rgba?\\(([^)]+)\\)/);
      if(m){ const p=m[1].split(',').map(parseFloat); if((p[3]===undefined?1:p[3])>0.95){ bg='rgb('+p[0]+','+p[1]+','+p[2]+')'; break; } }
      n=n.parentElement; }
    return { t:(e.innerText||'').trim().slice(0,24), color:cs.color, bg, size:parseFloat(cs.fontSize) }; });
  return { dataTheme: document.documentElement.getAttribute('data-theme'),
           htmlClass: (document.documentElement.className||'').slice(0,60),
           bodyBg: getComputedStyle(document.body).backgroundColor,
           prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
           labelNodes: info };
})()`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const probe = PROBE.replace('VISFN', VIS);
  const out={};
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil:'networkidle' });
  try {
    await page.emulateMedia({ colorScheme:'light' }); await page.waitForTimeout(1800);
    out.light = await page.evaluate(probe);
    await page.emulateMedia({ colorScheme:'dark' }); await page.waitForTimeout(2200);
    out.darkViaMedia = await page.evaluate(probe);
  } finally { await page.emulateMedia({ colorScheme:null }); }
  return out;
};
