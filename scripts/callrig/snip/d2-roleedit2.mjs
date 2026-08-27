const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const SCOPE = process.env.D2_SCOPE || 'workspace';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=${SCOPE}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  const base = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const sbRight=Math.max(...[...document.querySelectorAll('a[href*="/settings/"]')]
      .map(a=>a.getBoundingClientRect().right).concat([0]));
    // EVERY interactive-ish node in the content column, visible or not
    const all=[...main.querySelectorAll('button,a[href],input,select,textarea,[role],[onclick],[tabindex]')]
      .filter(e=>e.getBoundingClientRect().left>=sbRight-1);
    return { sbRight, total:all.length,
      hiddenOnes: all.filter(e=>!(new Function('el','return ('+${JSON.stringify(VIS)}+')(el)')(e)))
        .map(e=>({tag:e.tagName.toLowerCase(),t:(e.innerText||'').trim().slice(0,30),al:(e.getAttribute('aria-label')||'').slice(0,45),role:e.getAttribute('role')||''})).slice(0,20),
      editish: all.map(e=>({tag:e.tagName.toLowerCase(),t:(e.innerText||'').trim().slice(0,40),al:(e.getAttribute('aria-label')||'').slice(0,55),role:e.getAttribute('role')||'',tid:e.getAttribute('data-testid')||''}))
        .filter(o=>/edit|pencil|manage|modif|change|настро/i.test(o.t+' '+o.al+' '+o.tid)),
      allLabels: all.filter(e=>e.tagName==='BUTTON').map(e=>((e.innerText||'').trim()||e.getAttribute('aria-label')||'(unlabelled)').slice(0,55))
    }; })()`);
  // does clicking a role name do anything? try the D2 union W chip/name node
  const clickProbe = await page.evaluate(`(async () => { const vis=(${VIS});
    const T='D2 union W';
    const nodes=[...document.querySelectorAll('*')].filter(e=>!e.children.length&&(e.innerText||'').trim()===T).filter(vis);
    if(!nodes.length) return {found:0};
    const n=nodes[0]; const r=n.getBoundingClientRect();
    const cs=getComputedStyle(n); const par=n.closest('button,a,[role=button]');
    return { found:nodes.length, cursor:cs.cursor, clickableAncestor: par?(par.tagName+':'+((par.innerText||'').trim()||par.getAttribute('aria-label')||'').slice(0,40)):null,
             rect:[Math.round(r.x),Math.round(r.y)] }; })()`);
  return { scope:SCOPE, base, clickProbe };
};
