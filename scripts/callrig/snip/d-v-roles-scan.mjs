export default async ({page}) => {
  const out = {};
  const ws = 'W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/roles?scope=company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  out.url = page.url();

  out.tabs = await page.evaluate(() => {
    const main = document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button,a,[role=tab],[role=radio],[role=combobox]')]
      .filter(e=>e.offsetParent!==null)
      .map(e=>`${e.getAttribute('role')||e.tagName.toLowerCase()}:${(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,34)}`)
      .slice(0,50);
  });

  // permission labels: read the checkbox list entries in whatever markup they use
  out.perms = await page.evaluate(() => {
    const main = document.querySelector('main')||document.body;
    const boxes = [...main.querySelectorAll('input[type=checkbox],[role=checkbox],[role=switch]')]
      .filter(e => e.offsetParent !== null || e.getBoundingClientRect().width>0);
    const labelFor = (el) => {
      // walk up to a row container and take its text
      let n = el;
      for (let i=0;i<5 && n;i++){ n = n.parentElement;
        if (n && (n.innerText||'').trim().length>0) return (n.innerText||'').trim().split('\n')[0].slice(0,80); }
      return '';
    };
    const labels = boxes.map(labelFor).filter(Boolean);
    return {count: boxes.length, labels,
      rawKeys: labels.filter(s => /^[a-z][a-z_]*(\.[a-z][a-z_]*)+$/.test(s.trim()))};
  });
  return out;
}
