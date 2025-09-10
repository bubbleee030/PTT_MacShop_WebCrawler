// --- 全域常數設定 ---
const targetBoardUrl = "https://www.ptt.cc/bbs/MacShop/index.html";
const DISCORD_WEBHOOK_URL = "請在這裡填入您的 Discord Webhook URL";
const LAST_ARTICLE_TITLE_KEY = "LAST_ARTICLE_TITLE";

// --- ✨ 您可以在這裡自訂您感興趣的關鍵字 ---
// 關鍵字不分大小寫。只要文章標題包含其中任何一個，就會被通知。
// 如果陣列留空 (像這樣: []), 代表不進行篩選，所有新文章都會通知。
const KEYWORDS = ["iphone", "mac", "出售"];


// --- 主要執行函式 ---
function main() {
  console.log("--- 執行開始 ---");

  const scriptProperties = PropertiesService.getScriptProperties();
  const lastTitle = scriptProperties.getProperty(LAST_ARTICLE_TITLE_KEY);
  console.log("1. 上次記錄的最新文章標題是: '" + (lastTitle || '尚未記錄') + "'");

  const articles = fetchPttArticles();

  // --- DEBUG: 印出所有抓到的文章 ---
  if (articles && articles.length > 0) {
    console.log("======= DEBUG: 開始列出所有抓到的 " + articles.length + " 篇文章 =======");
    articles.forEach((article, index) => {
      console.log(`${index + 1}. 標題: ${article.title}, URL: ${article.url}`);
    });
    console.log("======= DEBUG: 列表結束 =======");
  } else {
    console.log("抓取到的文章陣列為空或無效。");
    console.log("--- 執行結束 ---");
    return;
  }
  // --- DEBUG 結束 ---
  
  if (!articles || articles.length === 0) {
    console.log("抓取文章失敗或列表為空，執行結束。");
    return;
  }
  
  // 取得最新一篇文章
  const latestArticle = articles[articles.length - 1];
  console.log("2. 成功從 PTT 抓取到 " + articles.length + " 篇一般文章。最新一篇是: '" + latestArticle.title + "'");

  // 找出所有新發布的文章
  let newArticles = [];
  if (!lastTitle) {
    console.log("首次執行，將所有文章視為新文章。");
    newArticles = articles;
  } else {
    const lastIndex = articles.findIndex(article => article.title === lastTitle);
    if (lastIndex === -1) {
      console.log("在列表中找不到上次的文章標題，可能頁面已翻過一整頁。將所有文章視為新文章。");
      newArticles = articles;
    } else {
      newArticles = articles.slice(lastIndex + 1);
    }
  }

  if (newArticles.length === 0) {
    console.log("3. 沒有發現新文章。");
    console.log("--- 執行結束 ---");
    return;
  }

  console.log(`3. 發現 ${newArticles.length} 篇新文章，準備進行關鍵字過濾...`);
  
  let matchedArticles = [];
  // --- ✨ 關鍵字過濾邏輯 ---
  if (KEYWORDS && KEYWORDS.length > 0) {
    console.log("您設定的關鍵字為: [" + KEYWORDS.join(", ") + "]");
    matchedArticles = newArticles.filter(article => {
      const titleLower = article.title.toLowerCase();
      return KEYWORDS.some(keyword => titleLower.includes(keyword.toLowerCase()));
    });
  } else {
    console.log("關鍵字陣列為空，不進行篩選，所有新文章都將被通知。");
    matchedArticles = newArticles; // 直接將所有新文章賦予 matchedArticles
  }
  // --- 過濾結束 ---

  if (matchedArticles.length > 0) {
    console.log(`4. 成功！有 ${matchedArticles.length} 篇新文章符合條件，準備發送通知...`);
    sendDiscordNotification(matchedArticles);
    console.log("5. 已發送 Discord 通知。");
  } else {
    console.log("4. 所有新文章皆不符合您設定的關鍵字，不發送通知。");
  }

  scriptProperties.setProperty(LAST_ARTICLE_TITLE_KEY, latestArticle.title);
  console.log("6. 已將最新文章標記更新為: '" + latestArticle.title + "'");
  
  console.log("--- 執行結束 ---");
}


/**
 * 從 PTT 抓取最新一頁的文章列表，並忽略置底公告
 * @returns {Array<Object>} 文章物件陣列，包含 title 和 url
 */
function fetchPttArticles() {
  const urlWithCacheBuster = targetBoardUrl + "?t=" + new Date().getTime();
  
  const headers = {
    'Cookie': 'over18=1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
  };

  const options = {
    'method': 'get',
    'headers': headers,
    'muteHttpExceptions': true
  };

  let htmlContent;
  try {
    const response = UrlFetchApp.fetch(urlWithCacheBuster, options);
    htmlContent = response.getContentText();
  } catch(e) {
    console.error("抓取 PTT 頁面時發生網路錯誤: " + e.message);
    return [];
  }
  
  if (!htmlContent || htmlContent.length < 1000) {
    console.log("抓取到的 HTML 內容異常，長度過短。");
    return [];
  }

  const separator = '<div class="r-list-sep"></div>';
  const separatorIndex = htmlContent.indexOf(separator);
  if (separatorIndex !== -1) {
    htmlContent = htmlContent.substring(0, separatorIndex);
  }

  const postRegex = /<div class="r-ent">[\s\S]*?<div class="title">([\s\S]*?)<\/div>[\s\S]*?<div class="date">/g;
  let match;
  const articles = [];          
  
  while ((match = postRegex.exec(htmlContent)) !== null) {
    const titleHtml = match[1].trim();
    if (titleHtml.includes('本文已被刪除')) {
        continue;
    }
    const linkMatch = titleHtml.match(/<a href="(\/bbs\/MacShop\/M\..*?\.html)">(.*?)<\/a>/);
    
    if (linkMatch) {
      articles.push({
        title: linkMatch[2].trim(),
        url: "https://www.ptt.cc" + linkMatch[1]
      });
    }
  }
  
  return articles;
}


/**
 * 發送 Discord Webhook 通知
 * @param {Array<Object>} newArticles - 要發送的新文章陣列
 */
function sendDiscordNotification(newArticles) {
  const messages = newArticles.map(article => `新文章：${article.title}\n${article.url}`);
  const content = messages.join("\n\n");

  const payload = JSON.stringify({
    content: content,
  });

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
  };

  try {
    UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, options);
  } catch (e) {
    console.error("發送 Discord 通知失敗: " + e.message);
  }
}
