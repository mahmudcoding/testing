export default async ({ page }) => {
  const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  const api = await page.evaluate(async () => {
    const W = 'W4QDF1XTURESO01';
    const r = await fetch(`/api/v1/workspaces/${W}/members?limit=50`, { credentials: 'include' });
    const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
    const arr = Array.isArray(j) ? j : (j && (j.members || j.items || j.data)) || [];
    const one = arr.find(m => /Alice/.test(JSON.stringify(m))) || arr[0] || {};
    const keys = o => Object.keys(o || {});
    return { status: r.status, count: arr.length, topKeys: keys(j).slice(0,8),
      memberKeys: keys(one), userKeys: keys(one.user),
      hasDept: /"department"/.test(t), hasPosition: /"position"/.test(t),
      hasJobTitle: /"job_?[Tt]itle"/.test(t), sampleUser: JSON.stringify(one.user || one).slice(0, 320) };
  });
  const groups = await page.evaluate(`(() => { const vis = ${VIS};
    const main = document.querySelector('main')||document.body;
    const heads = [...main.querySelectorAll('h1,h2,h3,h4,[role=heading]')].filter(vis).map(h=>h.innerText.trim().replace(/\\s+/g,' ').slice(0,40));
    const txt = (main.innerText||'').replace(/\\s+/g,' ');
    return { headings: heads.slice(0,12), showsQuality: /Quality/.test(txt), showsEngineerTitle: /QA Engineer/.test(txt),
             firstChars: txt.slice(0,180) }; })()`);
  return { membersApi: api, directoryUI: groups };
};
