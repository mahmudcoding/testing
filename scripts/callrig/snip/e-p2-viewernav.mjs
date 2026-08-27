import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const view = `(() => { ${VISFN} ${boxVisFn}
  const p=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis)
    .filter(e=>interactives(e).some(x=>/Next image|Open original/i.test(x.label))).pop();
  if(!p) return {none:true};
  const imgs=[...p.querySelectorAll('img')].map(i=>{const r=i.getBoundingClientRect();
    return 'nat'+i.naturalWidth+'x'+i.naturalHeight+' rendered'+Math.round(r.width)+'x'+Math.round(r.height)+' vis='+vis(i)+' op='+getComputedStyle(i).opacity;});
  return {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,160),
    ctrls: interactives(p).map(x=>x.label.slice(0,22)).join(' | ').slice(0,200), imgs,
    anyError:/unavailable|cannot|error|not supported/i.test(p.innerText||'')}; })()`;
export default async ({page, ctx}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /viewer\\.png/); })()`);
  await page.waitForTimeout(4000);
  out.a_first = await page.evaluate(view);
  out.next = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis)
      .filter(e=>interactives(e).some(x=>/Next image/i.test(x.label))).pop();
    return p? clickDeepest(p, /^Next image$/) : 'no panel'; })()`);
  const t=[]; for(let i=0;i<8;i++){ await page.waitForTimeout(700); const s=await page.evaluate(view); t.push(s.none?'none':(s.text+' :: '+(s.imgs[0]||'noimg'))); }
  out.b_afterNextTrace = [...new Set(t)];
  out.tabsBefore = ctx.pages().length;
  out.openOriginal = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis)
      .filter(e=>interactives(e).some(x=>/Open original/i.test(x.label))).pop();
    return p? clickDeepest(p, /^Open original$/) : 'no panel'; })()`);
  await page.waitForTimeout(4000);
  out.tabsAfter = ctx.pages().length;
  out.tabUrls = ctx.pages().map(p=>p.url().replace(/^https:\/\/[^/]+/,'').slice(0,60));
  return out;
};
