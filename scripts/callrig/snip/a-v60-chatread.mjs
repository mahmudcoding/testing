const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return (j?.email??'').split('@')[0];});
  const opened = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
    return d? /Chat ·|No messages|Message everyone/i.test(d.innerText||'') : false;},VS);
  if(!opened){ await page.locator('button[aria-label="Call chat"]').first().click().catch(()=>{}); await page.waitForTimeout(2600); }
  const r = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    const txt=(d.innerText||'').replace(/\s+/g,' ');
    return { header:(txt.match(/Chat · [^ ]+( [^ ]+)?/)||[''])[0], hasRoomChat:/V60-ROOMCHAT/.test(txt),
             authorNames:[...new Set((txt.match(/QA (Alice|Bob|Carol)/g)||[]))], body:txt.slice(0,300) };},VS);
  return { who, ...r };
};
