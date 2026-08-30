/* sector L: alice completes the Start now dialog -> in call. Public + Open so anyone joins directly */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.evaluate(DOM);
  const q = () => page.evaluate(()=>{
    const w=window.__qa;
    const d=[...document.querySelectorAll('[role=dialog]')].filter(w.boxVis).pop();
    if(!d) return null;
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,400),
            buttons:[...d.querySelectorAll('button')].filter(w.vis).map(w.nameOf).filter(Boolean)};
  });
  out.before = await q();
  // name the call
  await page.evaluate(()=>{
    const i=[...document.querySelectorAll('[role=dialog] input')].find(x=>x.type==='text'||!x.type);
    if(i){ i.focus(); }
  });
  const stamp = new Date().toISOString().slice(11,19).replace(/:/g,'');
  await page.keyboard.type(`L media ${stamp}`);
  await page.waitForTimeout(400);
  // choose Open entry mode explicitly (so bob/carol/dave land straight in)
  out.open = await page.evaluate(()=>{
    const w=window.__qa;
    const el=[...document.querySelectorAll('[role=dialog] [role=radio],[role=dialog] button,[role=dialog] label')]
      .filter(w.vis).find(n=>/^Open\b/i.test(w.nameOf(n)));
    if(!el) return {ok:false};
    el.click(); return {ok:true, name:w.nameOf(el).slice(0,50)};
  });
  await page.waitForTimeout(500);
  out.submit = await page.evaluate(()=>{
    const w=window.__qa;
    const d=[...document.querySelectorAll('[role=dialog]')].filter(w.boxVis).pop();
    return w.clickDeepest(/^(Start|Start now|Create|Start call)$/i, d);
  });
  await page.waitForTimeout(7000);
  out.url = page.url();
  out.meetingId = (out.url.match(/\/call\/([^/?]+)/)||[])[1] || null;
  out.toolbar = await page.evaluate(()=>{
    const w=window.__qa;
    return [...document.querySelectorAll('button')].filter(w.vis).map(w.nameOf).filter(Boolean).slice(0,40);
  });
  return out;
};
