export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', parent='M4OWSWLE61Y8WAA';
  const out={};
  try{ await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); }catch(e){}
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(8000);
  await page.evaluate(()=>navigator.clipboard.writeText('QA-S2-CLIPBOARD-SENTINEL')).catch(()=>{});
  const reply=await page.evaluate((parent)=>{
    const els=[...document.querySelectorAll('[data-message-id]')]
      .filter(e=>e.getBoundingClientRect().x>900 && e.getAttribute('data-message-id')!==parent);
    const last=els[els.length-1];
    return last? last.getAttribute('data-message-id'):null;
  }, parent);
  out.replyId=reply; out.parent=parent;
  if(!reply) return out;
  const el=page.locator(`[data-message-id="${reply}"]`).first();
  await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  const sh=page.locator('[role="menu"]').getByText('Share',{exact:true}).first();
  out.shareFound=await sh.count();
  if(!out.shareFound) return out;
  await sh.click();
  const samples=[];
  for(let i=0;i<8;i++){ await page.waitForTimeout(400);
    samples.push(await page.evaluate(async()=>{
      let clip=null; try{ clip=await navigator.clipboard.readText(); }catch(e){ clip='ERR:'+String(e).slice(0,26); }
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      return {clip: clip? clip.slice(0,140):null,
        notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,40)),
        dialog: !!document.querySelector('[role="dialog"]')};
    }));
  }
  out.first=samples[0]; out.last=samples.at(-1);
  out.noticesSeen=[...new Set(samples.flatMap(s=>s.notices))];
  out.clipChanged=samples.some(s=>s.clip && !s.clip.includes('SENTINEL'));
  out.finalClip=samples.map(s=>s.clip).filter(c=>c&&!c.includes('SENTINEL')).pop()||null;
  return out;
};
