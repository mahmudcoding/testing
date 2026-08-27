import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEARCHIVE0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||j?.data?.email||'?';})()`);
  const dump = `(() => { ${VISFN}
    const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
    const panels=[...document.querySelectorAll('[role=dialog],aside,[data-testid*=details],[data-testid*=panel]')].filter(boxVis);
    const p = panels[panels.length-1];
    return { nPanels: panels.length,
      panelText: p? (p.innerText||'').replace(/\\n+/g,' | ').slice(0,700):'(none)',
      panelCtrls: p? interactives(p).map(d=>d.label.slice(0,30)+(d.disabled?'[DIS]':'')).join(' | ').slice(0,700):'(none)',
      allBodyCtrls: interactives(document).map(d=>d.label.slice(0,26)).join(' | ').slice(0,900) };
  })()`;
  out.beforeDetails = await page.evaluate(`(() => { ${VISFN} return interactives(document.querySelector('main')||document.body).map(d=>d.label.slice(0,28)).join(' | ').slice(0,400); })()`);
  try { await page.getByRole('button',{name:'Channel details', exact:true}).first().click({timeout:8000}); } catch(e){ out.detailsClick='ERR '+String(e).slice(0,80); }
  await page.waitForTimeout(2500);
  out.details = await page.evaluate(dump);
  return out;
};
