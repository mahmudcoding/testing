export default async ({page}) => {
  const out={};
  out.vis=await page.evaluate(()=>{
    const hits=[...document.querySelectorAll('button')]
      .filter(b=>/^Add users$/i.test((b.innerText||b.getAttribute('aria-label')||'').trim()));
    return hits.map(b=>{
      let op=1,n=b;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden') return {opacityProduct:0,hidden:true};
        n=n.parentElement;}
      const r=b.getBoundingClientRect();
      const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return {opacityProduct:+op.toFixed(2),
        rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
        hitIsSelfOrChild:!!hit&&(b.contains(hit)||hit.contains(b))};});});
  const visible=(out.vis||[]).some(x=>x.opacityProduct>0 && x.hitIsSelfOrChild);
  out.genuinelyVisible=visible;
  if(!visible) return out;
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,42));};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,20));},true);});
  await page.locator('button').filter({hasText:/^Add users$/}).first().click({timeout:6000}).catch(()=>{out.clickFail=true});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.requests=reqs.slice(0,3);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    return {landed:window.__c,
      dialog:d?{text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,150),
        buttons:[...new Set([...d.querySelectorAll('button')].filter(v)
          .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20)))]}:null};});
  return out;
};
