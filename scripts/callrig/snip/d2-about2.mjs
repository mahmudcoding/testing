const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/about`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    // content area only: everything to the right of the settings nav
    const inContent = e => e.getBoundingClientRect().left > 300;
    const full=(main.innerText||'').replace(/\\s+/g,' ');
    const i=full.lastIndexOf('›'); const body=(i>=0?full.slice(i+1):full).trim();
    // enumerate EVERY interactive thing, not one tag type
    const interactive=[...main.querySelectorAll('button,a[href],input,select,textarea,summary,[role=switch],[role=button],[role=link],[role=tab],[tabindex]')]
      .filter(vis).filter(inContent)
      .map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                 text:(e.innerText||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,40),
                 href:(e.getAttribute('href')||'').slice(0,60) }));
    const kw={};
    for (const k of ['licen','licence','license','help','support','terms','privacy polic','open source','contact','documentation','FAQ'])
      kw[k]=new RegExp(k,'i').test(body);
    // is the page scrollable with more below the fold?
    const sc=[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);
      return e.scrollHeight-e.clientHeight>40 && /auto|scroll/.test(s.overflowY) && vis(e);})[0];
    return { bodyChars: body.length, bodyFull: body.slice(0,1200),
             interactiveInContent: interactive, interactiveCount: interactive.length,
             keywordsPresent: kw,
             contentScrollable: sc? { scrollH:sc.scrollHeight, clientH:sc.clientHeight } : null }; })()`);
};
