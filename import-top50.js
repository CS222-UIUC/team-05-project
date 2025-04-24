// import-top50.js
require('dotenv').config();           // 1. 先加载 .env
const mongoose = require('mongoose');
const axios    = require('axios');
const cheerio  = require('cheerio');
const Game     = require('./backend/models/game');  // 你的模型文件路径

// 2. 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });
    console.log('✔️ 已连接到 MongoDB');
  } catch (err) {
    console.error('❌ 连接 MongoDB 失败：', err);
    process.exit(1);
  }
}

// 3. 爬取畅销榜 appid 列表
async function fetchTopAppids(limit = 500) {
  const perPage = 50;
  const pages   = Math.ceil(limit / perPage);
  const list    = [];

  for (let page = 1; page <= pages; page++) {
    console.log(`🔍 抓取第 ${page}/${pages} 页...`);
    const url = `https://store.steampowered.com/search/?filter=globaltopsellers&os=win&page=${page}`;
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    $('.search_result_row').each((_, el) => {
      if (list.length >= limit) return;
      const href  = $(el).attr('href') || '';
      const m     = href.match(/app\/(\d+)\//);
      const title = $(el).find('.title').text().trim();
      if (m) list.push({ appid: m[1], title });
    });

    // 避免被封，休息 1 秒
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`🎯 共抓取到 ${list.length} 个游戏`);
  return list;
}

// 4. 拉取单个游戏详情
async function fetchGameDetail(appid) {
  try {
    const detailUrl = `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=en`;
    const { data }  = await axios.get(detailUrl);
    const info = data[appid].data;
    if (!info || !info.name) return null;

    return {
      title:        info.name,
      genre:        Array.isArray(info.genres) ? info.genres.map(g => g.description) : [],
      release_date: info.release_date?.date ? new Date(info.release_date.date) : null,
      rating:       info.metacritic?.score || 0,               // 用 Metacritic score 作为示例
      describe:     info.short_description || '',
      cover_url:    info.header_image || ''
    };
  } catch (err) {
    console.warn(`⚠️ 拉取 ${appid} 详情失败：`, err.message);
    return null;
  }
}

// 5. 主流程
(async () => {
  await connectDB();

  const topList = await fetchTopAppids(500);
  for (const { appid, title } of topList) {
    console.log(`➡️ 处理：${title}（${appid}）`);
    const detail = await fetchGameDetail(appid);
    if (!detail) continue;

    // upsert：如果同名游戏已存在，就更新；否则插入
    await Game.findOneAndUpdate(
      { title: detail.title },
      detail,
      { upsert: true, new: true }
    );

    // 小休息
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('✅ 全部导入完成');
  mongoose.disconnect();
})();
