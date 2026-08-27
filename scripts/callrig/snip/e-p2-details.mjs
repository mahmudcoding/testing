import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const F=process.env.QA_FILE || 'qa-e-image.png';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(`(() => { window.__clip=[];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      const o=navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = async (t) => { window.__clip.push(String(t)); try { return await o(t); } catch(e) { return; } }; }
    const oe=document.execCommand && document.execCommand.bind(document);
    if (oe) document.execCommand = (...a) => { if(a[0]==='copy'){ const s=window.getSelection&&String(window.getSelection()); if(s) window.__clip.push('exec:'+s); } return oe(...a); }; })()`);
  await page.locator('main button').filter({hasText:F}).first().hover();
  await page.waitForTimeout(1300);
  await page.evaluate(`(() => { ${VISFN}
    const tiles=[...document.querySelectorAll('main button')].filter(b=>(b.textContent||'').includes(${JSON.stringify(F)}));
    const tr=tiles[0].getBoundingClientRect();
    const c=[...document.querySelectorAll('button[aria-label="More actions"]')].filter(vis)
      .sort((a,b)=>Math.abs(a.getBoundingClientRect().y-tr.y)-Math.abs(b.getBoundingClientRect().y-tr.y))[0];
    c && c.click(); })()`);
  await page.waitForTimeout(1800);
  out.openDetails = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=b[b.length-1]; if(!p) return 'no menu';
    return clickDeepest(p, /view details/i); })()`);
  await page.waitForTimeout(3000);
  out.panel = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const cands=[...document.querySelectorAll('aside,[role=dialog],[data-testid*=detail],[class*=detail]')].filter(boxVis)
      .filter(e=>/Details/i.test(e.innerText||''));
    const p=cands[cands.length-1];
    if(!p) return 'no panel';
    const imgs=[...p.querySelectorAll('img')].map(i=>{const r=i.getBoundingClientRect();
      return 'natural '+i.naturalWidth+'x'+i.naturalHeight+' rendered '+Math.round(r.width)+'x'+Math.round(r.height)+' fit='+getComputedStyle(i).objectFit+' src='+String(i.getAttribute('src')||'').slice(0,60);});
    return {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,420),
      ctrls: interactives(p).map(x=>x.label.slice(0,26)).join(' | ').slice(0,400), imgs}; })()`);
  out.clickCopyLink = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const cands=[...document.querySelectorAll('aside,[role=dialog],[class*=detail]')].filter(boxVis).filter(e=>/Details/i.test(e.innerText||''));
    const p=cands[cands.length-1]||document.body;
    return clickDeepest(p, /copy link/i); })()`);
  await page.waitForTimeout(2500);
  out.clipboard = await page.evaluate(`(() => (window.__clip||[]))()`);
  return out;
};
