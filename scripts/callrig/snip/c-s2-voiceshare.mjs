export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  try{ await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); }catch(e){}
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const id=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>[...x.querySelectorAll('button')].some(b=>/voice-/.test(b.getAttribute('aria-label')||'')));
    return e? e.getAttribute('data-message-id'):null;});
  out.voiceMsg=id;
  if(!id) return out;
  await page.evaluate(async()=>{ try{ await navigator.clipboard.writeText('QA-SENTINEL'); }catch(e){} });
  const el=page.locator(`main [data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
  await el.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1400);
  const share=page.getByText(/^Share$/).first();
  out.shareFound=await share.count();
  if(!out.shareFound){ await page.keyboard.press('Escape'); return out; }
  await share.click(); await page.waitForTimeout(2500);
  out.clipboard=await page.evaluate(async()=>{ try{ return await navigator.clipboard.readText(); }catch(e){ return 'ERR'; } });
  if(!/^http/.test(out.clipboard||'')) return out;
  // follow the link from a clean load
  await page.goto('about:blank'); await page.waitForTimeout(800);
  await page.goto(out.clipboard);
  await page.waitForTimeout(12000);
  out.afterFollow=await page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    if(!e) return {present:false, url:location.pathname+location.search};
    const r=e.getBoundingClientRect();
    return {present:true, url:location.pathname+location.search,
      inView:r.top>=-4&&r.bottom<=innerHeight+4,
      text:(e.innerText||'').replace(/\s+/g,' ').slice(0,60),
      voiceButtons:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
        .filter(a=>a&&/voice|Play|Pause/i.test(a)),
      looksEmpty:((e.innerText||'').replace(/\s+/g,'').length<12)};}, id);
  return out;
};
