import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
// look for ANY node in the subtree whose class/aria/text hints at presence
const scan = `(root) => { const hits=[];
  [...root.querySelectorAll('*')].forEach(e=>{
    const c=String(e.className||''); const al=e.getAttribute('aria-label')||''; const t=e.getAttribute('title')||'';
    const dt=[...e.attributes].filter(a=>/status|presence|online|offline|active/i.test(a.name+a.value)).map(a=>a.name+'='+a.value).join(',');
    if(/online|offline|presence|status-dot|indicator|away|busy/i.test(c+al+t) || dt) hits.push(e.tagName+'|'+c.slice(0,50)+'|al='+al+'|'+dt);
  });
  const txt=(root.innerText||'');
  return {hits:hits.slice(0,10), textHasOnline: /online|offline|active now|away/i.test(txt)}; }`;
export default async ({page}) => {
  const out={};
  // 1. channel members panel
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  try { await page.getByRole('button',{name:/members/i}).first().click({timeout:8000}); } catch(e){ out.memErr=String(e).slice(0,70); }
  await page.waitForTimeout(2500);
  out.channelMembers = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const s=${scan};
    const boxes=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis); const p=boxes[boxes.length-1];
    return p? Object.assign({text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,300)}, s(p)) : {none:true}; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  // 2. profile popup from directories
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.getByRole('button',{name:"Open QA Bob's profile"}).first().click();
  await page.waitForTimeout(2500);
  out.profilePopup = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const s=${scan};
    const boxes=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper]')].filter(boxVis); const p=boxes[boxes.length-1];
    return p? Object.assign({text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,300)}, s(p)) : {none:true}; })()`);
  // 3. whole document scan
  out.wholeDoc = await page.evaluate(`(() => { const s=${scan}; return s(document.body); })()`);
  return out;
};
