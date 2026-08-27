const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { const m=r.request().method();
    if(m==='GET'||!/\/api\//.test(r.url())||/rum/.test(r.url())) return;
    let b=''; try{b=(await r.text()).slice(0,150);}catch{}
    net.push(`${m} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,52)} -> ${r.status()} ${b}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  // open card -> Share, using real mouse clicks at element centres
  const clickAt = async (finder) => {
    const box = await page.evaluate(`(() => { const vis=(${VIS}); ${finder}
      if(!el) return null; const r=el.getBoundingClientRect();
      return { x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2), t:(el.innerText||'').trim().slice(0,22) }; })()`);
    if(!box) return null;
    await page.mouse.click(box.x, box.y);
    return box;
  };
  const out={};
  out.name = await clickAt(`const el=[...document.querySelectorAll('button,a[href],[role=button]')].filter(vis).filter(b=>/QA Alice/.test(b.innerText||''))[0];`);
  await page.waitForTimeout(2200);
  out.share = await clickAt(`const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
     const el=dlg? [...dlg.querySelectorAll('button')].filter(vis).filter(x=>/^Share$/i.test((x.innerText||'').trim()))[0]:null;`);
  await page.waitForTimeout(2400);
  net.length=0;
  out.target = await clickAt(`const dlgs=[...document.querySelectorAll('[role=dialog]')].filter(vis);
     const last=dlgs[dlgs.length-1];
     const el=last? [...last.querySelectorAll('button')].filter(vis).filter(x=>/qa-empty/i.test(x.innerText||''))[0]:null;`);
  await page.waitForTimeout(3500);
  out.after = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const txt=dlg.map(d=>(d.innerText||'').replace(/\\s+/g,' ')).join(' | ').slice(0,220);
    const body=(document.body.innerText||'').replace(/\\s+/g,' ');
    return { dialogsOpen:dlg.length, dialogText:txt,
             errorAnywhere:/could not share|Try again|не удалось/i.test(body) }; })()`);
  out.requests=[...net].slice(0,4);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  return out;
};
