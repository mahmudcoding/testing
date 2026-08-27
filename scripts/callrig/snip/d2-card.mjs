const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(`(() => { const vis=(${VIS});
    return { bodyLen:(document.body.innerText||'').length,
             dialogs:[...document.querySelectorAll('[role=dialog]')].filter(vis).length }; })()`);
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const leaf=[...document.querySelectorAll('*')].filter(e=>!e.children.length)
      .filter(e=>(e.innerText||'').trim()==='QA Alice').filter(vis);
    if(!leaf.length) return {err:'name not visible'};
    let n=leaf[0];
    for(let i=0;i<6&&n;i++){ const c=n.closest('button,a,[role=button],[role=listitem],li,tr');
      if(c){ c.scrollIntoView({block:'center'}); c.click(); return {clickedTag:c.tagName, txt:(c.innerText||'').replace(/\\s+/g,' ').slice(0,60)}; }
      n=n.parentElement; }
    leaf[0].click(); return {clickedTag:'leaf'}; })()`);
  await page.waitForTimeout(3000);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const panel=dlg.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    const t = panel ? (panel.innerText||'') : (document.body.innerText||'');
    return { bodyLen:(document.body.innerText||'').length, dialogs:dlg.length,
      url:location.pathname+location.search,
      panelText: panel ? t.replace(/\\s+/g,' ').trim().slice(0,600) : '(no dialog)',
      fullBodyHas: { jobTitle:/QA Engineer/.test(document.body.innerText||''),
                     dept:/Quality/.test(document.body.innerText||''),
                     pronouns:/they\\/them/.test(document.body.innerText||''),
                     phone:/998 90 000/.test(document.body.innerText||''),
                     github:/octocat/.test(document.body.innerText||''),
                     website:/example\\.org/.test(document.body.innerText||''),
                     linkedin:/in\\/example/.test(document.body.innerText||''),
                     timezone:/Tashkent|\\+05|UTC/i.test(document.body.innerText||'') } }; })()`);
  return { before, clicked, after };
};
