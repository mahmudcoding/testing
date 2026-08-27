export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(5000);
  return page.evaluate(()=>{
    const b=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return {label:b&&b.getAttribute('aria-label'), pressed:b&&b.getAttribute('aria-pressed'),
      ls:String(localStorage.getItem('aloqa.channel.mute')),
      vis:document.visibilityState, url:location.pathname};
  });
};
