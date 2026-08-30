/* sector O: alice starts an instant group call on lane E. QA_CALLNAME sets the name. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QEF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  out.activeBefore = await page.evaluate(async (w)=>{
    const r=await fetch(`/api/v1/workspace/${w}/meetings/active`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.meetings||j.data||[]).map(m=>({id:m.id,name:m.name}));
  }, WS);
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Start now$/i));
  await page.waitForTimeout(2000);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(()=>{
    const q=window.__qa;
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(q.boxVis);
    const d=ds.filter(x=>[...x.querySelectorAll('button')].length<=10).pop()||ds.pop();
    if(!d) return null;
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,700),
            buttons:[...d.querySelectorAll('button')].filter(q.vis).map(n=>({n:q.nameOf(n),t:n.getAttribute('data-testid')})),
            inputs:[...d.querySelectorAll('input,textarea')].map(n=>({t:n.getAttribute('data-testid'),ph:n.placeholder,v:n.value,type:n.type}))};
  });
  const name = process.env.QA_CALLNAME;
  if (name) {
    const inp = await page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
    if (inp) { await inp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await inp.type(name); }
    out.typed = name;
    await page.waitForTimeout(400);
    const sub = await page.$('[data-testid="calls-start-submit"]');
    if (sub) { await sub.click(); out.submitted = true; }
    await page.waitForTimeout(6000);
  }
  out.url = page.url();
  out.activeAfter = await page.evaluate(async (w)=>{
    const r=await fetch(`/api/v1/workspace/${w}/meetings/active`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.meetings||j.data||[]).map(m=>({id:m.id,name:m.name,status:m.status}));
  }, WS);
  return out;
};
