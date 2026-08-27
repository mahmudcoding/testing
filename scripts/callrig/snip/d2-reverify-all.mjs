const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01'; const out={};
  const go = async p => { await page.goto('https://airion-cargo.store'+p, { waitUntil:'networkidle' }); await page.waitForTimeout(2200); };
  const ctrls = () => page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
    return [...main.querySelectorAll('button,a,input,select,textarea,[role=switch],[role=combobox]')].filter(vis)
      .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
      .map(e=>(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').trim().slice(0,32)); })()`);
  const text = () => page.evaluate(`(() => { const m=document.querySelector('main')||document.body;
    const t=(m.innerText||''); const i=t.lastIndexOf('\\u2039')>=0?t.lastIndexOf('\\u2039'):t.lastIndexOf('\\u203a');
    return (i>=0?t.slice(i+1):t).replace(/\\s+/g,' ').trim().slice(0,300); })()`);

  // #12 Sessions: one session -> zero actions
  await go(`/w/${W}/settings/sessions`);
  out['12_sessions'] = { controls: (await ctrls()).length, promise: (await text()).includes('how to sign one out') };
  // #13 company create: exactly two controls
  await go('/company/create');
  out['13_companyCreate'] = { controls: await ctrls() };
  // #14 subtitles
  const subs={};
  for (const [k,p] of [['about',`/w/${W}/settings/about`],['security',`/w/${W}/settings/security`],
                       ['adminWorkspaces',`/w/${W}/settings/admin/workspaces`],['dashboard',`/w/${W}/settings/admin/company`]]) {
    await go(p); const t=await text();
    subs[k]={ licences:/licence/i.test(t), encryption:/encryption key/i.test(t),
              whoMayOpen:/who may open/i.test(t), recentActivity:/recent activity/i.test(t) };
  }
  out['14_subtitles']=subs;
  // #5 privacy: five controls under Visibility
  await go(`/w/${W}/settings/privacy`);
  out['5_privacy'] = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main');
    const combos=[...main.querySelectorAll('[role=combobox]')].filter(vis).length;
    const sw=[...main.querySelectorAll('[role=switch]')].filter(vis).length;
    return { comboboxes:combos, switches:sw }; })()`);
  // #7/#8 appearance controls exist
  await go(`/w/${W}/settings/appearance`);
  out['7_8_appearance'] = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main');
    const heads=[...main.querySelectorAll('h2,h3,h4')].filter(vis).map(h=>h.innerText.trim());
    return { hasSidebarPosition: heads.includes('Sidebar position'), hasMessageLayout: heads.includes('Message layout') }; })()`);
  return out;
};
