const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const read = () => page.evaluate(`(() => { const vis=(${VIS});
    const de=document.documentElement;
    const radios=[...(document.querySelector('main')||document.body).querySelectorAll('[role=radio],button')].filter(vis)
      .filter(e=>['Light','Dark','System'].includes((e.innerText||'').trim()))
      .map(e=>(e.innerText||'').trim()+'='+(e.getAttribute('aria-checked')||e.getAttribute('aria-pressed')||'?'));
    return { dataTheme: de.getAttribute('data-theme'),
      resolvedCookie:(document.cookie.match(/aloqa\\.theme-resolved=([^;]*)/)||[])[1]||null,
      themeCookie:(document.cookie.match(/aloqa\\.theme=([^;]*)/)||[])[1]||null,
      prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
      bg: getComputedStyle(document.body).backgroundColor,
      themeRadios: radios }; })()`);
  const out={};
  // ensure theme = System
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('[role=radio],button')].filter(vis).filter(e=>(e.innerText||'').trim()==='System');
    if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(1500);
  for (const scheme of ['light','dark','light']) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.waitForTimeout(1800);
    out['emulate_'+scheme+'_'+Math.random().toString(36).slice(2,5)] = await read();
  }
  // and with an explicit Dark choice, the OS should not matter
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('[role=radio],button')].filter(vis).filter(e=>(e.innerText||'').trim()==='Dark');
    if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(1500);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForTimeout(1500);
  out.explicitDark_osLight = await read();
  await page.emulateMedia({ colorScheme: null });
  return out;
};
