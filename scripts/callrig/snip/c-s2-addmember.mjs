export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const made=await page.evaluate(async (ws)=>{
    const name='qa-c2-add-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json(); return {id:cj.id||cj.channel_id||(cj.channel&&cj.channel.id), name};}, ws);
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made.id}`);
  await page.waitForTimeout(11000);
  const out={channel:made.name};
  out.addPaths=await page.evaluate(()=>{
    const vis=(e)=>{let op=1,n=e;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden') return 0; n=n.parentElement;}
      const r=e.getBoundingClientRect(); return (r.width>3&&r.height>3)?+op.toFixed(2):0;};
    return [...document.querySelectorAll('button,a')]
      .map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26), v:vis(b)}))
      .filter(x=>/add (users|members|people)|invite/i.test(x.t));});
  const live=(out.addPaths||[]).find(x=>x.v>0);
  out.usableAddControl=live||null;
  if(!live) return out;
  await page.locator('button,a').filter({hasText:new RegExp('^'+live.t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first()
    .click({timeout:6000}).catch(e=>{out.clickErr=String(e.message).slice(0,40);});
  await page.waitForTimeout(4000);
  out.dialog=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    if(!d) return 'NO-DIALOG';
    return {text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,120),
      inputs:[...d.querySelectorAll('input')].filter(v).map(i=>i.getAttribute('placeholder')||'(none)'),
      buttons:[...new Set([...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22)))].slice(0,10)};});
  return out;
};
