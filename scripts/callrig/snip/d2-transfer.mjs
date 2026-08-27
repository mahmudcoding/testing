const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const pages = [
    ['settings/workspace', `/w/${W}/settings/workspace`],
    ['admin/workspaces',   `/w/${W}/settings/admin/workspaces`],
    ['admin/members',      `/w/${W}/settings/admin/members`],
    ['roles(workspace)',   `/w/${W}/settings/roles?scope=workspace`],
    ['directories',        `/w/${W}/directories?tab=people`],
    ['settings/company',   `/w/${W}/settings/company`]
  ];
  const out=[];
  for (const [name,path] of pages) {
    await page.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await page.waitForTimeout(2800);
    const r = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const all=[...main.querySelectorAll('*')].filter(vis).filter(e=>{
        const t=e.tagName.toLowerCase(); const r=e.getAttribute('role')||'';
        return t==='button'||t==='a'||t==='input'||t==='select'||['button','link','menuitem','option'].includes(r); })
        .map(e=>((e.getAttribute('aria-label')||'')+' '+(e.innerText||'')).trim().replace(/\\s+/g,' ').slice(0,50));
      const txt=(main.innerText||'');
      return { totalControls: all.length,
        matches: all.filter(x=>/transfer|ownership|make .*owner|owner/i.test(x)).slice(0,6),
        textMentionsTransfer: (txt.match(/.{0,40}[Tt]ransfer.{0,50}/g)||[]).slice(0,3) }; })()`);
    out.push({ page:name, ...r });
  }
  return out;
};
