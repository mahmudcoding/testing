const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const THEMEBTNS = `() => {
  const heads=[...document.querySelectorAll('main h2,main h3,main h4')];
  const hd = heads.find(x => /^Theme/i.test((x.innerText||'').trim())); if(!hd) return null;
  let box=hd.parentElement; for(let i=0;i<5&&box;i++){ if(box.querySelectorAll('button').length>=3) break; box=box.parentElement; }
  return [...box.querySelectorAll('button')].slice(0,3).map(b => { const s=getComputedStyle(b);
    return { label:(b.innerText||'').trim().split('\\n')[0], checked:b.getAttribute('aria-checked'),
             pressed:b.getAttribute('aria-pressed'), state:b.getAttribute('data-state'), sel:b.getAttribute('aria-selected'),
             bg:s.backgroundColor, border:s.borderColor, color:s.color, outline:s.outlineStyle,
             cls:(b.className||'').toString().replace(/\\s+/g,' ').slice(0,70) }; }); }`;
export default async ({ page }) => {
  const AP = 'https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance';
  const shell = () => page.evaluate(() => ({
    dataTheme: document.documentElement.getAttribute('data-theme') || '(none)',
    htmlClass: (document.documentElement.className||'').slice(0,80),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    stored: (() => { try { return JSON.parse(localStorage.getItem('aloqa.appearance')||'{}').theme; } catch { return '?'; } })()
  }));
  await page.goto(AP, { waitUntil: 'networkidle' }); await page.waitForTimeout(2800);
  const initialBtns = await page.evaluate(`(${THEMEBTNS})()`);
  const initialShell = await shell();

  const clickTheme = async name => {
    const h = await page.evaluateHandle(`(() => { const vis = ${VIS};
      const heads=[...document.querySelectorAll('main h2,main h3,main h4')].filter(vis);
      const hd = heads.find(x => /^Theme/i.test((x.innerText||'').trim()));
      let box=hd.parentElement; for(let i=0;i<5&&box;i++){ if(box.querySelectorAll('button').length>=3) break; box=box.parentElement; }
      return [...box.querySelectorAll('button')].find(b => (b.innerText||'').trim().startsWith(${JSON.stringify(name)})); })()`);
    const el = h.asElement(); if (!el) return 'not found';
    await el.scrollIntoViewIfNeeded(); await el.click(); await page.waitForTimeout(1600);
    return { shell: await shell(), buttons: await page.evaluate(`(${THEMEBTNS})()`) };
  };
  const dark = await clickTheme('Dark');
  const light = await clickTheme('Light');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2800);
  const afterReload = { shell: await shell(), buttons: await page.evaluate(`(${THEMEBTNS})()`) };
  return { initialShell, initialBtns, afterDark: dark, afterLight: light, afterReload };
};
