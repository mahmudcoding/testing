import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // cold: about:blank first, so no in-memory client state survives
  await page.goto('about:blank'); await page.waitForTimeout(1500);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  out.state = await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const arch=await g('/api/v1/users/me/channels/archived');
     const aa=(arch.j&&(arch.j.channels||arch.j.data||arch.j.items))||[];
     const act=await g('/api/v1/workspaces//channels');
     const ac=(act.j&&(act.j.channels||act.j.data||act.j.items))||[];
     return {archivedSt:arch.st,
             archivedHasProbe:aa.some(c=>c.id==='C4OX3463S8ECN8X'),
             archivedNames:aa.map(c=>c.name).slice(0,5),
             activeHasProbe:ac.some(c=>c.id==='C4OX3463S8ECN8X'),
             activeNames:ac.map(c=>c.name).slice(0,5)}; })()`);
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  const bb = await bell.boundingBox();
  await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await page.waitForTimeout(250);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(4000);
  out.panel = await page.evaluate(`(() => { ${VISFN}
     const p=[...document.querySelectorAll('[role=dialog],[role=menu],[class*=popover],[class*=Popover]')]
       .filter(e=>e.getBoundingClientRect().width>200).pop();
     if(!p) return {err:'no panel'};
     const rows=[...p.querySelectorAll('[role=option],[role=menuitem],li')].filter(vis)
       .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,70));
     return {n:rows.length, rows:rows.slice(0,4), hasUnknown:/Unknown channel/i.test(p.innerText||'')}; })()`);
  return out;
};
