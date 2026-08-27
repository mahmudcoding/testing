const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  out.settingsHead = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return (d.innerText||'').replace(/\s+/g,' ').slice(0,340);},VS);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(1200);
  // Add to call
  await page.locator('button[aria-label="Add to call"]').first().click().catch(e=>out.addErr=String(e).slice(0,40));
  await page.waitForTimeout(2800);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/add-to-call.png'});
  out.addPanel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,340),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)).filter(Boolean).slice(0,14),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,26),val:(i.value||'').slice(0,90)})) };},VS);
  // API view of the meeting: is there a guest join url?
  out.api = await page.evaluate(async()=>{
    const id=location.pathname.split('/call/')[1];
    const r=await fetch('/api/v1/meeting/'+id,{credentials:'include'});
    const j=await r.json().catch(()=>null); const m=j?.meeting||j;
    return { status:r.status, keys:Object.keys(m||{}).filter(k=>/guest|link|url|token|join/i.test(k)),
             vals:Object.fromEntries(Object.entries(m||{}).filter(([k])=>/guest|link|url|join/i.test(k)).map(([k,v])=>[k,String(v).slice(0,80)])) };});
  return out;
};
