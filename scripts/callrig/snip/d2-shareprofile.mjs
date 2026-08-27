const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { const m=r.request().method();
    if(m==='GET'||!/\/api\//.test(r.url())) return;
    let b=''; try{b=(await r.text()).slice(0,140);}catch{}
    net.push(`${m} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,50)} -> ${r.status()} ${b}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const out={};
  out.openCard = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const el=[...main.querySelectorAll('button,a[href],[role=button]')].filter(vis)
      .filter(b=>/QA Alice/.test(b.innerText||''))[0];
    if(!el) return 'no name'; el.click(); return 'clicked name'; })()`);
  await page.waitForTimeout(2200);
  out.share = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!dlg) return 'no card';
    const b=[...dlg.querySelectorAll('button')].filter(vis).filter(x=>/^Share$/i.test((x.innerText||'').trim()))[0];
    if(!b) return 'no Share button'; b.click(); return 'clicked Share'; })()`);
  await page.waitForTimeout(2400);
  out.picker = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const txt=dlg.map(d=>(d.innerText||'').replace(/\\s+/g,' ')).join(' | ').slice(0,260);
    const items=dlg.length? [...dlg[dlg.length-1].querySelectorAll('button,[role=option],li')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26)).filter(Boolean).slice(0,12):[];
    return { dialogs:dlg.length, text:txt, items }; })()`);
  net.length=0;
  out.pick = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const last=dlg[dlg.length-1]; if(!last) return 'no dialog';
    const t=[...last.querySelectorAll('button,[role=option],li')].filter(vis)
      .filter(x=>/qa-empty|qa-general/i.test(x.innerText||''))[0];
    if(!t) return 'no channel option'; t.click(); return 'picked '+(t.innerText||'').trim().slice(0,20); })()`);
  await page.waitForTimeout(3000);
  out.afterPick = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const txt=dlg.map(d=>(d.innerText||'').replace(/\\s+/g,' ')).join(' | ').slice(0,240);
    const btns=dlg.length? [...dlg[dlg.length-1].querySelectorAll('button')].filter(vis)
      .map(b=>(b.innerText||'').trim().slice(0,22)).filter(Boolean):[];
    return { dialogsStillOpen:dlg.length, text:txt, buttons:btns,
             errorShown:/could not share|try again|не удалось/i.test(txt) }; })()`);
  out.requests=[...net].slice(0,4);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  return out;
};
