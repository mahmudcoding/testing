import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const TOKEN='qelanex7k2';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url(); if(u.includes('/api/v1/search')) reqs.push(u.replace(/^https:\/\/[^/]+/,'').slice(0,150)); });
  const dump = `(() => { ${VISFN}
    const m=document.querySelector('main')||document.body;
    const t=(m.innerText||'').replace(/\\n+/g,' ');
    const c=t.match(/All\\s+(\\d+)\\s+Messages\\s+(\\d+)\\s+Channels\\s+(\\d+)\\s+People\\s+(\\d+)\\s+Files\\s+(\\d+)/);
    return { counts: c? 'All='+c[1]+' Msg='+c[2]+' Ch='+c[3]+' Ppl='+c[4]+' Files='+c[5] : 'unparsed',
      allVisibleControls: interactives(m).map(x=>x.label.slice(0,26)).join(' | ').slice(0,420),
      visibleLeaves: [...new Set([...m.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
        .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,50)))].slice(0,18),
      mentionsChannel: /qa-general/.test(t) }; })()`;
  // direct URL, twice, plus the workspace-root variant
  for (const [tag, url] of [
      ['fullSearch_underChannel_run1', BASE+'/w/'+WS+'/c/C4QEGENERAL0001/search?q='+TOKEN],
      ['fullSearch_underChannel_run2', BASE+'/w/'+WS+'/c/C4QEGENERAL0001/search?q='+TOKEN],
      ['fullSearch_underPrivate',      BASE+'/w/'+WS+'/c/C4QEPRIVATE0001/search?q='+TOKEN]]) {
    reqs.length=0;
    await page.goto(url, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
    out[tag] = {url: page.url().replace(/^https:\/\/[^/]+/,''), ...await page.evaluate(dump), req: reqs.slice(-1)[0]};
  }
  return out;
};
