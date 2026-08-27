export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  try{ await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); }catch(e){ out.perm=String(e).slice(0,60); }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // wipe the clipboard first so a stale value cannot be mistaken for a fresh copy
  await page.evaluate(async()=>{ try{ await navigator.clipboard.writeText('QA-SENTINEL-EMPTY'); }catch(e){} });
  out.sentinel=await page.evaluate(async()=>{ try{ return await navigator.clipboard.readText(); }catch(e){ return 'ERR '+String(e).slice(0,40); } });
  // find the picked-mention message
  const target=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-V2-PICKED/.test(x.innerText||''));
    return e? {id:e.getAttribute('data-message-id'), text:(e.innerText||'').replace(/\s+/g,' ').slice(-40)}:null;});
  out.target=target;
  if(!target) return out;
  const el=page.locator(`main [data-message-id="${target.id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  const copy=el.locator('button[aria-label="Copy text"]').first();
  out.copyBtn=await copy.count();
  if(out.copyBtn){ await copy.click(); await page.waitForTimeout(2000); }
  out.clipboard=await page.evaluate(async()=>{ try{ return await navigator.clipboard.readText(); }catch(e){ return 'ERR '+String(e).slice(0,40); } });
  out.onScreen=target.text;
  out.PASS = typeof out.clipboard==='string' && /qa_c_bob/.test(out.clipboard) && !/QA Bob/.test(out.clipboard);
  return out;
};
