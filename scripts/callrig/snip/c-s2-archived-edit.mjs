const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  const out={};
  const mk = async (channel, tag) => {
    const resp=[];
    const onResp = r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET')
      resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,50)}); };
    page.on('response', onResp);
    await page.goto('about:blank'); await page.waitForTimeout(700);
    await page.goto(`https://airion-cargo.store/w/${WS}/c/${channel}`,{waitUntil:'load'});
    await page.waitForTimeout(8500);
    const row = page.locator('[data-message-id]').last();
    await row.scrollIntoViewIfNeeded().catch(()=>{});
    await row.hover(); await page.waitForTimeout(900);
    await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
    await page.waitForTimeout(1300);
    const menuOpen = await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      return [...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).length;
    });
    const item = page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Edit$/}).last();
    const state = await item.evaluate(b=>{
      const r=b.getBoundingClientRect();
      const c=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
      return {disabled:b.disabled, pe:getComputedStyle(b).pointerEvents, opacity:getComputedStyle(b).opacity,
        hit: c? (b===c||b.contains(c)) : false};
    });
    await item.click({timeout:8000});
    const frames=[];
    for (let i=0;i<10;i++){
      await page.waitForTimeout(400);
      frames.push(await page.evaluate(()=>{
        const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
        return {menus:[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).length,
          editing:/Editing message/.test(document.body.innerText),
          composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
          toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2)};
      }));
    }
    page.off('response', onResp);
    return {tag, menuOpenBefore:menuOpen, itemState:state,
      frames: frames.filter((f,i)=> i===0 || JSON.stringify(f)!==JSON.stringify(frames[i-1])), resp};
  };
  out.archived = await mk(CH, 'archived-channel');
  out.control  = await mk(PRIV, 'normal-channel-control');
  return out;
};
