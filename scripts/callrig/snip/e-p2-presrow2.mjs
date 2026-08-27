import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.presence = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/workspaces/${WS}/presence',{credentials:'include'});const j=await r.json();
    return (j.presences||[]).map(p=>p.user_id.replace('U4QE','').replace(/0+$/,'')+'='+(p.online?'ON':'off')).join(' ');})()`);
  const sig = (name) => `(() => { ${VISFN}
    const main=document.querySelector('main')||document.body;
    const btn=[...main.querySelectorAll('button')].filter(vis).find(b=>(b.innerText||'').replace(/\\s+/g,' ').trim()===${JSON.stringify(name)});
    if(!btn) return {missing:true};
    const row=btn.parentElement.parentElement;
    return {text:(row.innerText||'').replace(/\\s+/g,' ').slice(0,60), nodes:row.querySelectorAll('*').length,
      sig:[...row.querySelectorAll('*')].map(e=>e.tagName+'|'+String(e.className||'').replace(/\\s+/g,' ').trim().slice(0,80)+'|al='+(e.getAttribute('aria-label')||'')+'|ds='+(e.getAttribute('data-status')||'')).join('\\n')}; })()`;
  const bob = await page.evaluate(sig('QA Bob'));
  const carol = await page.evaluate(sig('QA Carol'));
  out.bobRow = {text:bob.text, nodes:bob.nodes};
  out.carolRow = {text:carol.text, nodes:carol.nodes};
  const x=(bob.sig||'').split('\n'), y=(carol.sig||'').split('\n');
  const d=[]; for(let i=0;i<Math.max(x.length,y.length);i++) if(x[i]!==y[i]) d.push(`#${i}\n  ONLINE(bob)  : ${x[i]||'(absent)'}\n  OFFLINE(carol): ${y[i]||'(absent)'}`);
  out.diffCount=d.length; out.diffs=d.slice(0,6);
  out.bobFullSig = x.slice(0,14);
  return out;
};
