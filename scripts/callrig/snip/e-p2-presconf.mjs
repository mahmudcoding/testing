import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.membersApiPresence = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/workspaces/${WS}/members',{credentials:'include'});const j=await r.json();
    return (j.members||[]).map(m=>m.name.replace('QA ','')+'='+(m.presence&&m.presence.online?'ON':'off')).join(' ');})()`);
  // status dots inside the directory list rows only
  out.directoryRows = await page.evaluate(`(() => { ${VISFN}
    const main=document.querySelector('main');
    const rows=[...main.querySelectorAll('div')].filter(d=>/^Q[A-Z] QA /.test((d.innerText||'').replace(/\\s+/g,' ').trim()) && (d.innerText||'').length<40 && d.className.includes('min-h-16'));
    return rows.map(r=>{
      const avatar=r.querySelector('[class*=avatar],[aria-label]');
      const statusSpans=[...r.querySelectorAll('span')].filter(s=>/bg-green|bg-gray|status/i.test(String(s.className||'')));
      return (r.innerText||'').replace(/\\s+/g,' ').slice(0,26)+' -> statusNodes:'+statusSpans.length;
    }); })()`);
  // popup for an online and an offline user
  for (const who of ['QA Bob','QA Carol']) {
    await page.getByRole('button',{name:"Open "+who+"'s profile"}).first().click();
    await page.waitForTimeout(2200);
    out['popup_'+who.replace(' ','_')] = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
      const boxes=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper]')].filter(boxVis); const p=boxes[boxes.length-1];
      if(!p) return {none:true};
      const dots=[...p.querySelectorAll('span')].filter(s=>/rounded-full/.test(String(s.className||''))&&/bg-/.test(String(s.className||'')));
      return {dots: dots.map(d=>(String(d.className).match(/bg-[a-z-]+/)||['?'])[0]), text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,90)}; })()`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  }
  return out;
};
