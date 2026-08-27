export default async ({page}) => {
  const out = {};
  // ids
  await page.goto('https://airion-cargo.store/w', {waitUntil:'domcontentloaded'});
  const ids = await page.evaluate(async () => {
    const ws = await (await fetch('/api/v1/users/me/workspaces',{credentials:'include'})).json();
    const list = Array.isArray(ws) ? ws : (ws.workspaces||ws.items||[]);
    const w = list.find(x => x.type !== 'personal') || list[0];
    return {wsId: w.id, coId: w.company_id || w.companyId, wsName: w.name};
  });
  out.ids = ids;

  // capture audit-log network from a cold load of the page
  const seen = [];
  page.on('response', r => {
    const u = r.url();
    if (u.includes('audit-log')) seen.push({url: u.replace(/^https:\/\/[^/]+/,''), status: r.status()});
  });
  await page.goto(`https://airion-cargo.store/w/${ids.wsId}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.pageRequests = seen;

  // rendered rows: enumerate table rows in the content area
  out.rendered = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('table tr')].filter(tr => tr.offsetParent !== null);
    const cells = rows.map(tr => [...tr.querySelectorAll('th,td')].map(c => (c.innerText||'').trim().slice(0,40)).join(' | ').slice(0,160));
    const bodyText = (document.querySelector('main')||document.body).innerText;
    return {
      rowCount: rows.length,
      rows: cells.slice(0,30),
      hasEmptyState: /No audit entries found/i.test(bodyText),
      subtitle: (bodyText.match(/A record of the administrative actions[^\n]*/)||[''])[0]
    };
  });

  // both endpoints directly
  out.api = await page.evaluate(async ({wsId, coId}) => {
    const get = async (u) => {
      const r = await fetch(u, {credentials:'include'});
      let j = null; try { j = await r.json(); } catch(e){}
      const arr = Array.isArray(j) ? j : (j?.entries || j?.items || []);
      return {status:r.status, count: Array.isArray(arr)?arr.length:null,
        events: (Array.isArray(arr)?arr:[]).map(e => `${e.action||e.event||e.type} [${e.scope_type||e.scopeType||'?'}]`)};
    };
    return {
      workspace: await get(`/api/v1/workspaces/${wsId}/admin/audit-log?limit=100`),
      company:   await get(`/api/v1/companies/${coId}/admin/audit-log?limit=100`)
    };
  }, ids);

  // controls on the page (filters?)
  out.controls = await page.evaluate(() => {
    const main = document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button,a,[role=button],select,input')]
      .filter(e => e.offsetParent !== null && e.getBoundingClientRect().width>0)
      .map(e => `${e.tagName.toLowerCase()}:${(e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim().slice(0,30)}`)
      .filter(s => !/^a:$/.test(s)).slice(0,40);
  });
  return out;
}
