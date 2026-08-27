// Send a real composer mention and capture the POST body the client sends.
export default async ({page}) => {
  const ch=process.env.QA_CH, who=process.env.QA_WHO||'qa_d_alice';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/'+ch,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  const bodies=[];
  page.on('request', r=>{ try{ const u=new URL(r.url());
    if(r.method()==='POST' && u.pathname.includes('/messaging/messages')) bodies.push(r.postData()||'(no body)');
  }catch{} });
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.first().click();
  await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await page.keyboard.type('QA-D2 chip probe ');
  await page.keyboard.type('@'+who.slice(0,8));
  await page.waitForTimeout(2500);
  out.pickerOpen = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    return [...document.querySelectorAll('[role=listbox],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis).length;
  });
  if (out.pickerOpen) { await page.keyboard.press('Enter'); await page.waitForTimeout(1000); }
  out.composerHtml = await page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return (c.innerHTML||'').slice(0,400);
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);
  out.postBodies = bodies;
  return out;
};
