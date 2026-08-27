const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const RADIO = `(heading) => { const vis=(${VIS});
  const heads=[...document.querySelectorAll('main h2,main h3,main h4')].filter(vis);
  const hd=heads.find(x=>new RegExp('^'+heading+'$','i').test((x.innerText||'').trim())); if(!hd) return 'no heading';
  let box=hd.parentElement; for(let i=0;i<5&&box;i++){ if(box.querySelectorAll('button').length>=2) break; box=box.parentElement; }
  return [...box.querySelectorAll('button')].map(b=>(b.innerText||'').trim().split('\\n')[0]+'='+b.getAttribute('aria-checked')); }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01'; const out={};
  const AP=`https://airion-cargo.store/w/${W}/settings/appearance`;
  await page.goto(AP, { waitUntil:'networkidle' }); await page.waitForTimeout(2500);
  out.storeAtStart = await page.evaluate(() => localStorage.getItem('aloqa.appearance')||'(absent)');
  const pick = async (heading, label) => {
    const h = await page.evaluateHandle(`(() => { const vis=(${VIS});
      const heads=[...document.querySelectorAll('main h2,main h3,main h4')].filter(vis);
      const hd=heads.find(x=>new RegExp('^'+${JSON.stringify(heading)}+'$','i').test((x.innerText||'').trim()));
      let box=hd.parentElement; for(let i=0;i<5&&box;i++){ if(box.querySelectorAll('button').length>=2) break; box=box.parentElement; }
      return [...box.querySelectorAll('button')].find(b=>(b.innerText||'').trim().startsWith(${JSON.stringify(label)})); })()`);
    const el=h.asElement(); if(!el) return 'not found';
    await el.scrollIntoViewIfNeeded(); await el.click(); await page.waitForTimeout(1200); return 'clicked';
  };
  // BUG-14: sidebar position
  out.sidebarClick = await pick('Sidebar position','Right');
  out.sidebarRadios = await page.evaluate(`(${RADIO})('Sidebar position')`);
  await page.goto(`https://airion-cargo.store/w/${W}/c/C4QDGENERAL0001`, { waitUntil:'networkidle' }); await page.waitForTimeout(3000);
  out.geometry = await page.evaluate(() => { const b=s=>{const e=document.querySelector(s); if(!e) return null;
    const r=e.getBoundingClientRect(); return Math.round(r.x)+'..'+Math.round(r.right); };
    return { rail:b('nav'), sidebar:b('aside'), main:b('main'),
             stored:(JSON.parse(localStorage.getItem('aloqa.appearance')||'{}')).sidebarSide }; });
  // BUG-15: message layout restore
  await page.goto(AP, { waitUntil:'networkidle' }); await page.waitForTimeout(2200);
  out.mlBefore = await page.evaluate(`(${RADIO})('Message layout')`);
  out.mlClick = await pick('Message layout','Compact');
  out.mlAfterClick = await page.evaluate(`(${RADIO})('Message layout')`);
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2500);
  out.mlAfterReload = await page.evaluate(`(${RADIO})('Message layout')`);
  out.mlStored = await page.evaluate(() => (JSON.parse(localStorage.getItem('aloqa.appearance')||'{}')).msgLayout);
  return out;
};
