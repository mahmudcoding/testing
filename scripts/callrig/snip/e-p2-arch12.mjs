import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  // 1) pinned bar: real visibility, not innerText
  out.pinned = await page.evaluate(()=>{
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n,node=null;
    while(n=walker.nextNode()){ if(/no message text/i.test(n.nodeValue)){node=n.parentElement;break;} }
    if(!node) return {found:false};
    let o=1,x=node; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return {found:true,visible:false,why:'display/visibility'}; o*=parseFloat(s.opacity||'1'); x=x.parentElement;}
    const r=node.getBoundingClientRect();
    const hit=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
    return {found:true, opacity:o, rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
      inViewport: r.y>=0 && r.y<innerHeight,
      hitIsSelfOrChild: !!hit && (node.contains(hit)||hit.contains(node)),
      text: (node.closest('div')||node).innerText.replace(/\s+/g,' ').slice(0,120)};
  });
  // 2) does the search UI expose an archived toggle? open search, enumerate EVERYTHING interactive
  await page.keyboard.press('Control+K').catch(()=>{});
  await page.waitForTimeout(1800);
  out.searchUI = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const els=[...document.querySelectorAll('button,a,[role=button],[role=checkbox],[role=switch],[role=tab],[role=option],input,select,label')].filter(vis);
    return {open: !!document.querySelector('input[type=search],input[placeholder*="Search" i]'),
      n:els.length,
      controls: els.map(e=>({t:e.tagName.toLowerCase()+(e.type?`[${e.type}]`:''), l:(e.getAttribute('aria-label')||e.placeholder||e.textContent||'').trim().slice(0,36)})).slice(0,45)};
  });
  return out;
};
