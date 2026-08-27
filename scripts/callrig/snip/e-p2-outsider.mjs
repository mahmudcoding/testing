import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  for (const [tag,path] of [['directories','/directories'],['calendar','/calendar'],['files','/files'],['channel','/c/C4QEGENERAL0001']]) {
    await page.goto(BASE+'/w/'+WS+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500);
    out[tag] = await page.evaluate(`(() => { ${VISFN}
      const m=document.querySelector('main')||document.body;
      const leaves=[...document.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
        .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,44));
      return {url:location.pathname, visibleText:[...new Set(leaves)].slice(0,14),
        ctrls: interactives(document).map(x=>x.label.slice(0,20)).join(' | ').slice(0,220)}; })()`);
  }
  return out;
};
