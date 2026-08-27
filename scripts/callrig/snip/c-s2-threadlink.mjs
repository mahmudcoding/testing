export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', parent='M4OWSWLE61Y8WAA';
  const out={};
  try{ await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); }catch(e){ out.perm=String(e).slice(0,40); }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(8000);
  // a reply inside the thread panel (x > 900)
  const reply=await page.evaluate((parent)=>{
    const els=[...document.querySelectorAll('[data-message-id]')]
      .filter(e=>e.getBoundingClientRect().x>900 && e.getAttribute('data-message-id')!==parent);
    const last=els[els.length-1];
    return last? {id:last.getAttribute('data-message-id'),
      txt:(last.innerText||'').replace(/\s+/g,' ').slice(0,40)}:null;
  }, parent);
  out.reply=reply;
  if(!reply) return out;
  const el=page.locator(`[data-message-id="${reply.id}"]`);
  await el.first().hover(); await page.waitForTimeout(500);
  out.inline = await el.first().evaluate(e=>[...e.querySelectorAll('button')]
    .filter(b=>b.getBoundingClientRect().height>4).map(b=>b.getAttribute('aria-label')).filter(Boolean));
  const more=el.first().locator('button[aria-label="More actions"]');
  if(await more.count()){ await more.first().click({force:true}); await page.waitForTimeout(800);
    out.menu=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');
      return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
    // click Share (which is where the link lives)
    const sh=page.locator('[role="menu"]').getByText('Share',{exact:true}).first();
    if(await sh.count()){ await sh.click(); await page.waitForTimeout(1600);
      out.shareDialog=await page.evaluate(()=>{
        const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>20);
        return d? {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,180),
          inputs:[...d.querySelectorAll('input')].map(i=>i.value.slice(0,120)),
          btns:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>4)
            .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,20))}:null;});
    }
  }
  return out;
};
