const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return (j?.email??'').split('@')[0];});
  out.who=who;
  await page.locator('button[aria-label="Call chat"]').first().click().catch(e=>out.openErr=String(e).slice(0,50));
  await page.waitForTimeout(2800);
  await page.screenshot({path:`/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/callchat-${who}.png`});
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,320),
      inputs:[...d.querySelectorAll('input,[contenteditable="true"],textarea')].filter(vis).map(i=>({tag:i.tagName,ph:(i.placeholder||i.getAttribute('aria-label')||'').slice(0,30)})),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24)).filter(Boolean).slice(0,14) };},VS);
  return out;
};
