export default async ({page}) => {
  const name=process.env.QA_NAME||'QA Night Room';
  const priv=process.env.QA_PRIVATE==='1';
  const invite=(process.env.QA_INVITE||'').split(',').filter(Boolean);
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('breakout')||u.includes('/api/v1/meeting')){if(r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,350);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}}});
  await page.locator('[data-testid="side-room-create-name"]').fill(name);
  if (priv) await page.locator('[data-testid="side-room-create-private"]').click();
  await page.waitForTimeout(500);
  const picked = await page.evaluate((invite)=>{
    const boxes=[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')];
    const out=[];
    for (const b of boxes){
      const lab=b.closest('label');
      const txt=lab?lab.innerText.replace(/\n+/g,' ').trim():'';
      if (invite.some(n=>txt.includes(n))) { if(!b.checked) b.click(); out.push(txt); }
    }
    return out;
  }, invite);
  await page.waitForTimeout(600);
  await page.locator('[data-testid="side-room-create-submit"]').click();
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="breakout-rooms-panel"]');
    return p?p.innerText.replace(/\n+/g,' | ').slice(0,400):null;
  });
  return {name, private: priv, picked, net, panelAfter: after};
};
