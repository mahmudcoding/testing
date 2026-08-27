import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.presence = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/workspaces/${WS}/presence',{credentials:'include'});const j=await r.json();
    return (j.presences||[]).map(p=>p.user_id.replace('U4QE','').replace(/0+$/,'')+'='+(p.online?'ON':'off')).join(' ');})()`);
  // full subtree signature of one person's row
  const rowDump = (name) => `(() => { ${VISFN}
    const main=document.querySelector('main')||document.body;
    let btn=[...main.querySelectorAll('button')].filter(vis).find(b=>(b.innerText||'').trim().startsWith(${JSON.stringify(name)}));
    if(!btn) return {missing:true};
    // climb to the row container (the list item wrapping this button)
    let row=btn; while(row.parentElement && row.parentElement!==main && (row.innerText||'').length<200 && row.parentElement.tagName!=='MAIN'){ if(row.tagName==='LI') break; row=row.parentElement; }
    const nodes=[...row.querySelectorAll('*')];
    return {
      rowTag: row.tagName,
      text: (row.innerText||'').replace(/\\n+/g,' / ').slice(0,80),
      nodeCount: nodes.length,
      sig: nodes.map(n=>n.tagName+'|'+String(n.className||'').replace(/\\s+/g,' ').trim().slice(0,60)+'|'+(n.getAttribute('aria-label')||'')+'|'+(n.getAttribute('title')||'')+'|'+(n.getAttribute('data-status')||'')).join('\\n'),
      svgs: nodes.filter(n=>n.tagName==='svg'||n.tagName==='SVG').length
    }; })()`;
  const bob = await page.evaluate(rowDump('QA Bob'));
  const carol = await page.evaluate(rowDump('QA Carol'));
  out.bob = {tag: bob.rowTag, text: bob.text, nodes: bob.nodeCount, svgs: bob.svgs};
  out.carol = {tag: carol.rowTag, text: carol.text, nodes: carol.nodeCount, svgs: carol.svgs};
  // line-by-line diff of the two signatures
  const a = (bob.sig||'').split('\n'), b = (carol.sig||'').split('\n');
  const diffs = [];
  for (let i=0; i<Math.max(a.length,b.length); i++) if (a[i]!==b[i]) diffs.push(`#${i} BOB[${a[i]||'-'}] CAROL[${b[i]||'-'}]`);
  out.identical = diffs.length===0;
  out.diffs = diffs.slice(0,8);
  return out;
};
