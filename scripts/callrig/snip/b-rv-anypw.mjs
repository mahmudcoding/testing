export default async ({page}) => {
  const out={};
  const pw = await page.$('input[type=password]');
  if (!pw) return {err:'no password field'};
  await pw.fill('totally-wrong-'+Date.now());
  await page.waitForTimeout(800);
  out.joinNow = await page.evaluate(()=>{ const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join call$/i.test((x.innerText||'').trim()));
    if(!b) return null; const r=b.getBoundingClientRect(); return {disabled:b.disabled===true, x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)}; });
  if (out.joinNow && !out.joinNow.disabled) { await page.mouse.click(out.joinNow.x, out.joinNow.y); await page.waitForTimeout(9000); }
  out.after = await page.evaluate(()=>{ const t=document.body.innerText.replace(/\s+/g,' ');
    return {url:location.href, inCall:/Leave call/i.test(t), barrier:/password-protected/i.test(t), tail:t.slice(-200)}; });
  return out;
};
