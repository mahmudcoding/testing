export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=10',{credentials:'include'})).json().catch(()=>null);
    const a=(j&&(j.notifications||j.items||j.data))||[];
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {
      notifs: a.slice(0,6).map(n=>({type:n.type, title:n.title, body:(n.body||n.message||'').slice(0,60), at:n.created_at})),
      startingSoon: /starting soon|starts in|скоро/i.test(t),
      schedRow: (t.match(/Scheduled today.{0,150}/)||[])[0]||null
    };
  });
};
