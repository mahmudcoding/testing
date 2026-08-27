import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const W2='W4OWJSPNXQJYZ5R';
export default async ({page}) => {
  const out={};
  for (const [tag,path] of [['calendar','/calendar'],['files','/files'],['directories','/directories?tab=people'],
                             ['dirChannels','/directories?tab=channels'],['mentions','/chat/mentions']]) {
    await page.goto(BASE+'/w/'+W2+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500);
    out[tag] = await page.evaluate(`(() => { ${VISFN}
      const m=document.querySelector('main')||document.body;
      const leaves=[...m.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
        .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,52));
      return {visible:[...new Set(leaves)].slice(0,14),
        ctrls: interactives(m).map(x=>x.label.slice(0,22)).join(' | ').slice(0,200)}; })()`);
  }
  return out;
};
