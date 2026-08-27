import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.apiRaw = await page.evaluate(`(async()=>{ const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own',{credentials:'include'});
    const t=await r.text(); const j=JSON.parse(t); const a=j.files||j.data||[];
    return a.map(f=>JSON.stringify(f).slice(0,230)); })()`);
  for (const fname of ['qa-e-image.png','qa-e-note.txt']) {
    const o={};
    await page.locator('main button').filter({hasText:fname}).first().hover();
    await page.waitForTimeout(1400);
    o.hoverButtons = await page.evaluate(`(() => { ${VISFN}
      const m=document.querySelector('main');
      return interactives(m).filter(x=>/favorit|More actions|Select /i.test(x.label)).map(x=>x.label.slice(0,24)); })()`);
    await page.getByRole('button',{name:'More actions'}).first().click();
    await page.waitForTimeout(2000);
    o.menuItems = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
      const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
      const p=b[b.length-1]; return p? interactives(p).map(x=>x.label.slice(0,26)).join(' | ') : 'no menu'; })()`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
    out[fname]=o;
  }
  return out;
};
