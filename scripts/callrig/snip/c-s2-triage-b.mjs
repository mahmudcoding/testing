export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  // ── ALK-2994: a long channel name pushes out the header controls
  const ch='C4OX0TTLIMVOUBH';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const LONG='qa-c2-'+'x'.repeat(90);
  out.rename=await page.evaluate(async({ch,name})=>{
    const cur=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, description:cur.description||''})});
    return {status:r.status, was:cur.name, len:name.length};},{ch,name:LONG});
  await page.reload(); await page.waitForTimeout(9000);
  out.header=await page.evaluate(()=>{
    const inner=window.innerWidth;
    const m=document.querySelector('main');
    const vis=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      const hit=document.elementFromPoint(Math.round(r.left+r.width/2),Math.round(r.top+r.height/2));
      return o>0.05 && !!(hit&&(hit===e||e.contains(hit)));};
    const WANT=/^(Start call|Start or schedule call|Search in channel|Mute notifications|Unmute notifications|Channel details|\d+ members)$/;
    const ctrls=[...m.querySelectorAll('button,[role="button"]')]
      .filter(b=>WANT.test(b.getAttribute('aria-label')||''))
      .map(b=>({al:b.getAttribute('aria-label'), left:Math.round(b.getBoundingClientRect().left),
        right:Math.round(b.getBoundingClientRect().right), reachable:vis(b)}))
      .filter(x=>x.al);
    const nameNode=[...m.querySelectorAll('*')].filter(e=>e.children.length===0)
      .map(e=>({t:(e.textContent||'').trim(), r:e.getBoundingClientRect(), sw:e.scrollWidth, cw:e.clientWidth}))
      .find(x=>/^qa-c2-x{5,}/.test(x.t));
    return {viewport:inner, docScrollWidth:document.documentElement.scrollWidth,
      nameWidth: nameNode? Math.round(nameNode.r.width):null,
      nameClipped: nameNode? nameNode.sw>nameNode.cw : null,
      controls:ctrls.slice(0,10),
      offscreen:ctrls.filter(c=>c.left>=inner||c.right>inner+1).map(c=>c.al),
      unreachable:ctrls.filter(c=>!c.reachable).map(c=>c.al)};});
  // restore the name
  out.restore=await page.evaluate(async({ch,name})=>{
    const cur=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, description:cur.description||''})});
    return {status:r.status};},{ch,name:'qa-c2-deep'});
  return out;
};
