const fetch = require("node-fetch-native");
const path = require('path');
const fs = require('fs/promises');

let booklet_title = '';
// BOOKID
const BOOKID = BigInt('7263025165028556852').toString()
const BOOKLET_BODY = `{\"booklet_id\":\"${BOOKID}\"}`
// 主要修改x-secsdk-csrf-token和Cookie
const REQUESTT_INIT = {
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "x-secsdk-csrf-token": "",
    "Cookie": ""
  },
  "referrer": "https://juejin.cn/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
}

async function getSectionList() {
  const response = await fetch("https://api.juejin.cn/booklet_api/v1/booklet/get", Object.assign(REQUESTT_INIT, { "body": BOOKLET_BODY })).then(response => response.json())
  booklet_title = response.data.booklet.base_info.title
  return response.data.sections
}

async function getSection(section_id) {
  const response = await fetch("https://api.juejin.cn/booklet_api/v1/section/get", Object.assign(REQUESTT_INIT, { "body": `{\"section_id\":\"${BigInt(section_id).toString()}\"}` })).then(response => response.json())
  return response.data.section.markdown_show
}

async function sectionIO({ title, section_id, index }) {
  const section = await getSection(section_id)
  await fs.writeFile(path.join(process.cwd(), `${booklet_title}`, `${index}. ${title}.md`), section);
  console.log(`[${index}. ${title}], finish!!!`);
}

async function bootstrap() {
  const sections = await getSectionList();
  await fs.mkdir(path.join(process.cwd(), `${booklet_title}`), { recursive: true });

  let newSections = sections.map((item, index) => {
    return () => sectionIO({ title: item.title, section_id: item.section_id, index: index + 1 })
  });

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  for (const task of newSections) {
    await task();
    await delay(1000);
  }
}

bootstrap();