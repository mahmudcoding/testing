export default async ({page}) => {
  try{
    await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/C4QCGENERAL0001',{waitUntil:'domcontentloaded',timeout:20000});
    await page.waitForTimeout(2500);
    return {ok:true, url:page.url().slice(-30), msgs:await page.evaluate(()=>document.querySelectorAll('[data-message-id]').length)};
  }catch(e){ return {ok:false, err:e.message.slice(0,70)}; }
};
