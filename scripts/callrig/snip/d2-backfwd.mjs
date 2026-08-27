const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const where=()=>page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    const body=(i>=0?t.slice(i+1):t).trim();
    return { url:location.pathname+location.search, head:body.slice(0,60), chars:body.length,
      controls:[...main.querySelectorAll('button,input,[role=switch],[role=combobox],[role=radio]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings').length }; })()`);
  const steps=[];
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2400); steps.push({step:'load profile', ...await where()});
  // client-side nav via the left nav
  for (const target of ['appearance','notifications']) {
    await page.evaluate(`(() => { const vis=(${VIS});
      const a=[...document.querySelectorAll('a[href*="/settings/${target}"]')].filter(vis)[0]; if(a) a.click(); })()`);
    await page.waitForTimeout(2400); steps.push({step:'nav '+target, ...await where()});
  }
  await page.goBack({ waitUntil:'networkidle' }); await page.waitForTimeout(2200);
  steps.push({step:'back 1', ...await where()});
  await page.goBack({ waitUntil:'networkidle' }); await page.waitForTimeout(2200);
  steps.push({step:'back 2', ...await where()});
  await page.goForward({ waitUntil:'networkidle' }); await page.waitForTimeout(2200);
  steps.push({step:'forward 1', ...await where()});
  // deep tab state: roles page has ?scope= — does back restore the tab?
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2400); steps.push({step:'roles company', ...await where()});
  await page.evaluate(`(() => { const vis=(${VIS});
    const a=[...document.querySelectorAll('a')].filter(vis).filter(x=>/Workspace roles/.test(x.innerText||''))[0]; if(a) a.click(); })()`);
  await page.waitForTimeout(2400); steps.push({step:'switch to workspace tab', ...await where()});
  await page.goBack({ waitUntil:'networkidle' }); await page.waitForTimeout(2200);
  steps.push({step:'back to company tab?', ...await where()});
  return steps;
};
