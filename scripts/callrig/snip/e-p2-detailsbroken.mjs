import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const F='fake.png';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page, ctx}) => {
  const out={};
  // tidy: close any extra tab this pass opened
  const extras = ctx.pages().filter(p=>/\/api\/v1\/files\//.test(p.url()));
  for (const p of extras) { try { await p.close(); } catch(e){} }
  out.tabsNow = ctx.pages().length;
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.locator('main button').filter({hasText:F}).first().hover();
  await page.waitForTimeout(1300);
  await page.evaluate(`(() => { ${VISFN}
    const tiles=[...document.querySelectorAll('main button')].filter(b=>(b.textContent||'').includes(${JSON.stringify(F)}));
    const tr=tiles[0].getBoundingClientRect();
    const c=[...document.querySelectorAll('button[aria-label="More actions"]')].filter(vis)
      .sort((a,b)=>Math.abs(a.getBoundingClientRect().y-tr.y)-Math.abs(b.getBoundingClientRect().y-tr.y))[0];
    c && c.click(); })()`);
  await page.waitForTimeout(1800);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=b[b.length-1]; return clickDeepest(p, /view details/i); })()`);
  await page.waitForTimeout(3500);
  out.detailsPanel = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Details/i.test(e.innerText||'')).pop();
    if(!p) return 'no panel';
    const imgs=[...p.querySelectorAll('img')].map(i=>{const r=i.getBoundingClientRect();
      return 'nat'+i.naturalWidth+'x'+i.naturalHeight+' rendered'+Math.round(r.width)+'x'+Math.round(r.height)
        +' vis='+vis(i)+' op='+getComputedStyle(i).opacity;});
    return {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,240), imgs,
      anyError:/unavailable|cannot|error|not supported|preview/i.test(p.innerText||''),
      ctrls: interactives(p).map(x=>x.label.slice(0,24)).join(' | ').slice(0,200)}; })()`);
  return out;
};
