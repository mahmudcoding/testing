export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/files/F4OWBNL4R1V15YB/content',{credentials:'include'});
    const b=await r.blob();
    return {status:r.status, storedBytes:b.size, contentType:b.type,
      contentLengthHeader:r.headers.get('content-length')};
  });
};
