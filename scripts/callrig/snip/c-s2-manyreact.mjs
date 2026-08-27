const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-MANYREACT'); await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
  const id = await page.locator('[data-message-id]').last().getAttribute('data-message-id');
  out.id = id;
  // add many distinct reactions via API
  out.bulk = await page.evaluate(async ([ch,mid])=>{
    const emojis=['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋'];
    let ok=0, fail=0, firstErr=null;
    for (const e of emojis) {
      try { const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}`,{method:'POST',credentials:'include',
          headers:{'Content-Type':'application/json'}, body:JSON.stringify({emoji:e})});
        if (r.ok) ok++; else { fail++; if(!firstErr) firstErr=(await r.text()).slice(0,120); }
      } catch(err){ fail++; }
    }
    const g=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await g.json(); const m=(j.messages||[])[0]||{};
    return {ok, fail, firstErr, stored:(m.reactions||[]).length, tried:emojis.length};
  }, [PRIV, id]);
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.rendered = await page.evaluate((mid)=>{
    const el=document.querySelector(`[data-message-id="${mid}"]`);
    if(!el) return null;
    const r=el.getBoundingClientRect();
    const leaves=[...el.querySelectorAll('*')].filter(e=>e.children.length===0 && e.getBoundingClientRect().width>2);
    const clipped=leaves.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>({t:(e.textContent||'').slice(0,12), sw:e.scrollWidth, cw:e.clientWidth}));
    return {chips:[...el.querySelectorAll('button')].filter(b=>/^View /.test(b.getAttribute('aria-label')||'')).length,
      rect:{w:Math.round(r.width), h:Math.round(r.height), right:Math.round(r.right)}, viewport:innerWidth,
      overflowsViewport: r.right>innerWidth, pageOverflow: document.documentElement.scrollWidth>document.documentElement.clientWidth,
      clipped:clipped.slice(0,3)};
  }, id);
  return out;
};
