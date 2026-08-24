export default async ({page}) => {
  const M = process.env.QA_MEET;
  return await page.evaluate(async (M) => {
    const post = async (body, lang) => {
      const h = {'Content-Type':'application/json'};
      if (lang) h['Accept-Language']=lang;
      const r = await fetch('/api/v1/meeting/'+M+'/messages',{method:'POST',credentials:'include',headers:h,body:JSON.stringify(body)});
      const t = await r.text();
      let m=''; try{m=JSON.parse(t).message;}catch(e){m=t.slice(0,120);}
      return r.status+' :: '+m;
    };
    return {
      empty_noHdr:   await post({body:''}),
      empty_en:      await post({body:''}, 'en-US'),
      empty_ru:      await post({body:''}, 'ru-RU'),
      tooLong_en:    await post({body:'a'.repeat(600)}, 'en-US'),
      tooLong_ru:    await post({body:'a'.repeat(600)}, 'ru-RU'),
      selfRecip_en:  await post({body:'x', recipient_id:'U4QAALICE000001'}, 'en-US'),
      selfRecip_ru:  await post({body:'x', recipient_id:'U4QAALICE000001'}, 'ru-RU')
    };
  }, M);
};
