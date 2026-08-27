export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T', other='C4OX0TTLIMVOUBH';
  const out={};
  // read the DM so it is clean, then move away and stay put
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(9000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${other}`);
  await page.waitForTimeout(7000);
  const look=()=>page.evaluate((dm)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const links=[...document.querySelectorAll('nav a, aside a')].filter(v);
    const entry=links.find(a=>(a.getAttribute('href')||'').includes(dm));
    return {sidebarEntry: entry? (entry.innerText||'').replace(/\s+/g,' ').slice(0,40):'not in sidebar',
      anyBadge: links.map(a=>(a.innerText||'').replace(/\s+/g,' '))
        .filter(t=>/\d+$/.test(t.trim())).slice(0,4)};}, dm);
  out.before=await look();
  out.apiBefore=await page.evaluate(async({ws,dm})=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.unread_counts||[]).find(c=>c.channel_id===dm)||{note:'absent'};},{ws,dm});
  return out;
};
