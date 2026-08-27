export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OVEWOTJW1AA86';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(6000);
  return page.evaluate(()=>{
    const b=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return {label:b&&b.getAttribute('aria-label'), pressed:b&&b.getAttribute('aria-pressed'),
      ls:String(localStorage.getItem('aloqa.channel.mute')).slice(0,140),
      me:document.title, url:location.pathname};
  });
};
