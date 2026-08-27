export default async ({page}) => {
  const out={}; const ws='W4QDF1XTURESO01';
  for (const scope of ['company','workspace']) {
    await page.goto(`https://airion-cargo.store/w/${ws}/settings/roles?scope=${scope}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
    out[scope] = await page.evaluate(() => {
      const main=document.querySelector('main')||document.body;
      const txt = main.innerText||'';
      // isolate the Permissions section text
      const i = txt.indexOf('Permissions');
      const section = i>=0 ? txt.slice(i, i+1400) : '(no Permissions heading)';
      // method A: checkbox-ish nodes
      const a = [...main.querySelectorAll('input[type=checkbox],[role=checkbox],[role=switch]')].length;
      // method B: every visible interactive node whose row text looks like a permission line
      const labelNodes = [...main.querySelectorAll('label')].filter(e=>e.getBoundingClientRect().width>0);
      return {
        checkboxNodes: a,
        labelNodes: labelNodes.length,
        labelTexts: labelNodes.map(e=>(e.innerText||'').trim().split('\n')[0].slice(0,70)).slice(0,25),
        permissionsSection: section.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,25)
      };
    });
  }
  return out;
}
