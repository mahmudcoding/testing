export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const grab = async (scope) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=${scope}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    return await page.evaluate(()=>{
      const m=document.querySelector('main');
      // permission checkboxes and their labels
      const perms=[];
      m.querySelectorAll('label, [role="checkbox"], input[type=checkbox]').forEach(x=>{
        const r=x.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
        const t=(x.innerText||x.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim();
        if(t) perms.push(t.slice(0,70));
      });
      const raw = perms.filter(p=>/^[a-z][a-z0-9]*(\.[a-z0-9*]+)+$/.test(p) || /\b[a-z]+\.[a-z]+\b/.test(p));
      return {scope:location.search, perms:[...new Set(perms)].slice(0,30), rawLooking:[...new Set(raw)]};
    });
  };
  return {company: await grab('company'), workspace: await grab('workspace')};
};
