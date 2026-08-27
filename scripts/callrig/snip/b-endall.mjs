export default async ({page}) => {
  const out={};
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/End for everyone/i.test((x.innerText||x.getAttribute('aria-label')||''))); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(2000);
  out.confirm = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    if(!d) return null;
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,300), buttons:[...d.querySelectorAll('button')].map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean)};
  });
  // submit confirm
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-end-confirm-submit"]') || [...document.querySelectorAll('[role=dialog] button,[role=alertdialog] button')].find(x=>/^(End|End call|End for everyone|Confirm)/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(7000);
  out.after = await page.evaluate(()=>({url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,400)}));
  return out;
};
