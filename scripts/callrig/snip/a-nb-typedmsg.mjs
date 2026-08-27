import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const n = Number(process.env.QA_N || 600);
  const unit = 'abcdefghij ';
  let msg=''; while (msg.length < n) msg += unit; msg = msg.slice(0, n-3) + 'END';
  const out={typedLen: msg.length};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const e=[...p.querySelectorAll('textarea')].filter(vis)[0]; e.focus();
    const d=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value'); d.set.call(e,'');
    e.dispatchEvent(new Event('input',{bubbles:true})); }, VIS);
  await page.waitForTimeout(400);
  await page.keyboard.type(msg, {delay: 1});
  await page.waitForTimeout(800);
  out.beforeSend = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const e=[...p.querySelectorAll('textarea')].filter(vis)[0];
    const texts=[...p.querySelectorAll('*')].filter(x=>!x.childElementCount).filter(vis)
      .map(x=>(x.textContent||'').trim()).filter(x=>/\d{2,4}\s*\/|characters|limit|too long|max/i.test(x));
    const sendBtn=[...p.querySelectorAll('button')].filter(vis).find(b=>/^Send$/i.test((b.textContent||'').trim()));
    return {valueLen:e.value.length, tail:e.value.slice(-12), hints:texts.slice(0,5),
      sendDisabled: sendBtn?sendBtn.disabled:null}; }, VIS);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);
  out.afterSend = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {notes:[...p.querySelectorAll('*')].filter(x=>!x.childElementCount).filter(vis)
      .map(x=>(x.textContent||'').trim()).filter(x=>/limit|too long|shorten|max|characters/i.test(x)).slice(0,5)}; }, VIS);
  out.stored = await page.evaluate(async ()=>{
    const id=location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
    const r=await fetch(`/api/v1/meeting/${id}/messages?limit=2`,{credentials:'include'});
    const j=await r.json(); const arr=j.messages||j.data||[];
    const m=(Array.isArray(arr)?arr:[]).slice(-1)[0]||{};
    const b=m.body||m.text||m.content||'';
    return {len:b.length, tail:b.slice(-14)}; });
  return out;
};
