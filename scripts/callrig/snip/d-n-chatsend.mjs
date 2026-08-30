export default async ({page}) => {
  const TXT = process.env.QA_TEXT || 'msg';
  const out={};
  const ta = page.locator('[data-testid="in-call-chat-panel"] textarea').first();
  out.found = await ta.count();
  if(!out.found) return out;
  await ta.click(); await page.waitForTimeout(200);
  await ta.fill('');
  await ta.type(TXT,{delay:15});
  await page.waitForTimeout(300);
  out.typed = await ta.inputValue();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  out.afterVal = await ta.inputValue();
  out.list = await page.evaluate(()=>{
    const l=document.querySelector('[data-testid="in-call-chat-list"]');
    return l?(l.innerText||'').replace(/\s+/g,' ').slice(0,600):null;});
  return out;
};
