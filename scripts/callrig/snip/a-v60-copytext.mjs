const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page, ctx }) => {
  const out={};
  try { await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); } catch(e){ out.permErr=String(e).slice(0,70); }
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // post a message with characters markdown-escaping would mangle
  const tag='V60-COPY-'+Math.floor(Date.now()/1000%100000);
  const payload = tag+' a-b_c *star* 100% #hash (paren) 2+2=4';
  const comp=await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click();
  await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta'); await page.keyboard.press('Backspace');
  await page.keyboard.type(payload,{delay:14});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2600);
  const info = await page.evaluate(([vs,tag])=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).filter(x=>x.innerText?.includes(tag));
    const el=m[m.length-1]; if(!el) return null;
    // the rendered body text, minus author/time chrome
    const body=[...el.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText?.includes(tag))[0];
    return {id:el.getAttribute('data-message-id'), rendered:(body?.innerText||el.innerText||'').trim()};},[VS,tag]);
  out.sent=payload; out.rendered=info?.rendered;
  // raw stored body via API
  out.stored = await page.evaluate(async([tag])=>{
    const r=await fetch('/api/v1/messaging/channels/C4QAGENERAL0001/messages?limit=20',{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=Array.isArray(j)?j:(j?.messages??j?.data??[]);
    const m=(a||[]).find(x=>(x.body||'').includes(tag.split('-')[2]));
    return m?.body ?? null;},[tag]);
  // click Copy text and read the clipboard
  const el=await page.$(`[data-message-id="${info.id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(800);
  await page.click(`[data-message-id="${info.id}"] button[aria-label="Copy text"]`);
  await page.waitForTimeout(1200);
  out.clipboard = await page.evaluate(async()=>{ try{ return await navigator.clipboard.readText(); }catch(e){ return 'ERR:'+String(e).slice(0,60);} });
  out.match_rendered_vs_clipboard = out.rendered===out.clipboard;
  return out;
};
