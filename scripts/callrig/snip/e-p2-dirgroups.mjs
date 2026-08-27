import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.ui = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main')||document.body;
    // group headings: short all-caps-ish blocks that precede person rows
    const heads=[...m.querySelectorAll('h1,h2,h3,h4,[role=heading],div,span')].filter(vis)
      .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim())
      .filter(t=>/^[A-Z][A-Z \\-]{2,24}\\s*\\d*$/.test(t));
    return { groupHeads:[...new Set(heads)].slice(0,10),
             text:(m.innerText||'').replace(/\\s+/g,' ').slice(0,260) }; })()`);
  out.api = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/workspaces/'+'${WS}'+'/members?limit=50',{credentials:'include'});
    const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){return {st:r.status, raw:t.slice(0,300)};}
    const arr=d.members||d.data||d.items||[];
    return { st:r.status, n:arr.length, keys:Object.keys(arr[0]||{}).join(','),
             hasUserObj: arr.some(x=>x.user!==undefined),
             hasDept: arr.some(x=>x.department!==undefined||x.position!==undefined||x.job_title!==undefined),
             sample: JSON.stringify(arr[0]||{}).slice(0,320) }; })()`);
  return out;
};
