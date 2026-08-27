const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/d/C4OWQ0K3NB0XTRO`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const c=[...document.querySelectorAll('button')].filter(vis)
      .filter(e=>{const b=e.getBoundingClientRect(); return b.top<180 && b.left>380;})
      .filter(e=>(e.getAttribute('aria-label')||'')==='Profile');
    if(c.length!==1) return {n:c.length}; c[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const body=document.body.innerText||'';
    const cands=[...document.querySelectorAll('[role=dialog],aside,section,div')].filter(vis)
      .filter(e=>/QA Alice/.test(e.innerText||'') && (e.innerText||'').length<900);
    const p=cands.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    return { clickResult:${JSON.stringify(clicked)},
      panelText: p?(p.innerText||'').replace(/\\s+/g,' ').trim().slice(0,500):'(none found)',
      panelControls: p?[...p.querySelectorAll('button,a')].filter(vis)
        .map(e=>((e.innerText||'').trim()||e.getAttribute('aria-label')||'').slice(0,30)).filter(Boolean).slice(0,12):[],
      fieldsAnywhereOnPage:{ jobTitle:/QA Engineer/.test(body), department:/Quality/.test(body),
        pronouns:/they\\/them/.test(body), phone:/998 90 000/.test(body), github:/octocat/.test(body),
        website:/example\\.org/.test(body), linkedin:/in\\/example/.test(body),
        timezone:/Tashkent|GMT\\+5|UTC\\+5|\\+05:00|05:00/i.test(body) },
      bodyLen: body.length }; })()`);
};
