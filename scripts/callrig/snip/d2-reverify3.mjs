const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  const go=async p=>{ await page.goto(`https://airion-cargo.store${p}`,{waitUntil:'networkidle'}); await page.waitForTimeout(2600); };

  // ---- article 11: storage block wording
  await go(`/w/${W}/settings/admin/workspaces`);
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/Show storage/i.test(x.innerText||''));
    if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(1800);
  out.a11_storage = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { hasMyStorage:/My storage in this workspace/i.test(t),
             hasSharedLine:/Storage is shared by everyone in this workspace/i.test(t),
             excerpt:(t.match(/My storage[^]{0,150}/)||[])[0]||null,
             refused:/Admin access required|do not have permission/i.test(t),
             pageStarts:t.slice(0,120) }; })()`);

  // ---- article 12: unsaved changes discarded on navigation
  await go(`/w/${W}/settings/profile`);
  const orig = await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return (a.settings&&a.settings.profile&&a.settings.profile.jobTitle)||'';})()`);
  const typed = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const cands=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
      .filter(i=>(i.placeholder||'')!=='Filter settings' && i.type!=='search');
    const inp=cands[0];
    if(!inp) return {ok:false, visibleTextInputs:cands.length,
      allInputs:[...main.querySelectorAll('input')].filter(vis).map(i=>i.type+'/'+(i.placeholder||'').slice(0,18))};
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(inp,'D2-DIRTY-PROBE');
    inp.dispatchEvent(new Event('input',{bubbles:true}));
    return {ok:true, placeholder:(inp.placeholder||'(none)').slice(0,30), before:inp.value.slice(0,20)}; })()`);
  await page.waitForTimeout(1600);
  const dirty = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { unsavedBanner:/unsaved change/i.test(t),
             saveButtons:[...main.querySelectorAll('button')].filter(vis)
               .map(b=>(b.innerText||'').trim()).filter(x=>/Save|Discard/i.test(x)) }; })()`);
  await go(`/w/${W}/settings/appearance`);           // navigate away inside settings
  await go(`/w/${W}/settings/profile`);              // and back
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const vals=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis).map(i=>i.value);
    return { probeStillInAField: vals.some(v=>/D2-DIRTY-PROBE/.test(v)),
             unsavedBanner:/unsaved change/i.test(t) }; })()`);
  const apiAfter = await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return (a.settings&&a.settings.profile&&a.settings.profile.jobTitle)||'';})()`);
  out.a12_unsaved = { typed, dirty, after, jobTitleBefore:orig, jobTitleAfter:apiAfter,
                      nothingWasSaved: orig===apiAfter };

  // ---- article 18: company create page
  await go('/company/create');
  out.a18_companyCreate = await page.evaluate(`(() => { const vis=(${VIS});
    const all=[...document.querySelectorAll('button,a[href],input,select,textarea,summary,details,[role=switch],[role=button],[role=link],[role=tab],[onclick],[tabindex]')].filter(vis);
    return { interactiveInDocument: all.length,
             items: all.map(e=>e.tagName.toLowerCase()+(e.disabled?'[off]':'')+':'+((e.innerText||e.getAttribute('placeholder')||'').trim().slice(0,22))),
             headings: document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]').length,
             landmarks: document.querySelectorAll('main,nav,header,footer,[role=main]').length }; })()`);
  return out;
};
