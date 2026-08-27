import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const dump = (name) => `(() => { ${VISFN}
    const main=document.querySelector('main')||document.body;
    const btn=[...main.querySelectorAll('button')].filter(vis).find(b=>(b.innerText||'').replace(/\\s+/g,' ').trim()===${JSON.stringify(name)});
    if(!btn) return {missing:true, sample:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,20)).slice(0,12)};
    const par=btn.parentElement;
    const sigOf=(root)=>[...root.querySelectorAll('*')].map(n=>n.tagName+'|'+String(n.className||'').replace(/\\s+/g,' ').trim().slice(0,70)+'|al='+(n.getAttribute('aria-label')||'')+'|t='+(n.getAttribute('title')||'')+'|ds='+(n.getAttribute('data-status')||'')).join('\\n');
    return { btnText:(btn.innerText||'').replace(/\\s+/g,' ').slice(0,40),
      btnRect: Math.round(btn.getBoundingClientRect().width)+'x'+Math.round(btn.getBoundingClientRect().height),
      btnNodes: btn.querySelectorAll('*').length, parNodes: par? par.querySelectorAll('*').length : 0,
      parTag: par?par.tagName:null, parText:(par?.innerText||'').replace(/\\s+/g,' ').slice(0,60),
      btnSig: sigOf(btn), parSig: par? sigOf(par):'' }; })()`;
  const bob = await page.evaluate(dump('QA Bob'));
  const carol = await page.evaluate(dump('QA Carol'));
  out.bob = {text:bob.btnText, rect:bob.btnRect, btnNodes:bob.btnNodes, parTag:bob.parTag, parNodes:bob.parNodes, parText:bob.parText, missing:bob.missing, sample:bob.sample};
  out.carol = {text:carol.btnText, rect:carol.btnRect, btnNodes:carol.btnNodes, parTag:carol.parTag, parNodes:carol.parNodes, parText:carol.parText, missing:carol.missing};
  const cmp=(a,b,label)=>{ const x=(a||'').split('\n'), y=(b||'').split('\n'); const d=[];
    for(let i=0;i<Math.max(x.length,y.length);i++) if(x[i]!==y[i]) d.push(`${label}#${i}\n   BOB  : ${x[i]||'(absent)'}\n   CAROL: ${y[i]||'(absent)'}`);
    return d; };
  out.btnDiff = cmp(bob.btnSig, carol.btnSig, 'btn').slice(0,6);
  out.parDiff = cmp(bob.parSig, carol.parSig, 'par').slice(0,6);
  out.btnIdentical = out.btnDiff.length===0;
  out.parIdentical = out.parDiff.length===0;
  return out;
};
