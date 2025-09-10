# PTT MacShop 看板新文章 Discord 通知機器人

這是一個使用 Google Apps Script 編寫的自動化腳本，用於監控 PTT MacShop 看板的最新文章，並將符合指定關鍵字的新文章即時推送到您的 Discord 頻道。

整個專案完全免費，無需自行架設伺服器，只需一個 Google 帳號和 Discord 帳號即可完成部署。

## ✨ 功能特色

- **自動監控**：定時抓取 PTT MacShop 看板的最新文章列表。
- **即時通知**：透過 Discord Webhook 將新文章推送到指定的頻道。
- **關鍵字過濾**：可自訂一組關鍵字，只通知標題包含這些關鍵字的文章。
- **智慧篩選**：自動過濾掉置底的公告、板規、黑名單等非交易文章。
- **繞過年齡限制**：腳本已包含 `over18` cookie，可正常抓取內容。
- **雲端部署**：完全基於 Google Apps Script，無需任何本地伺服器或電腦持續開機。
- **高度客製化**：可輕鬆修改程式碼以監控其他 PTT 看板或更改關鍵字。

## ⚙️ 事前準備

1.  **一個 Google 帳號**：用於建立和執行 Google Apps Script。
2.  **一個 Discord 伺服器及頻道**：您需要有權限在該頻道中建立 Webhook。

## 🚀 設定教學

請依照以下步驟完成設定：

### 步驟 1：取得 Discord Webhook URL

1.  在您的 Discord 伺服器中，選擇您想要接收通知的頻道。
2.  點擊頻道名稱旁的齒輪圖示，進入「編輯頻道」。
3.  選擇「整合」分頁，點擊「建立 Webhook」。
4.  您可以為這個 Webhook 自訂名稱（例如 "PTT MacShop Bot"）和頭像。
5.  點擊「複製 Webhook URL」按鈕，將這串網址妥善保存。

### 步驟 2：建立 Google Apps Script 專案

1.  前往 [Google Apps Script 儀表板](https://script.google.com/home)。
2.  點擊左上角的「+ 新專案」。
3.  將專案命名為您喜歡的名稱（例如 "PTT MacShop Monitor"）。
4.  將編輯器中預設的程式碼 (`function myFunction() { ... }`) 全部刪除。
5.  將本 Repo 中的 `Code.gs` 檔案內容完整複製並貼到編輯器中。

### 步驟 3：設定腳本參數

在剛剛貼上的程式碼中，找到最上方的「全域常數設定」區塊，並進行修改：

1.  **`DISCORD_WEBHOOK_URL`**：將引號中的文字，替換成您在**步驟 1** 取得的 Discord Webhook URL。
    ```javascript
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/12345/abcdefg..."; // 換成你的
    ```

2.  **`KEYWORDS`** (選填)：在陣列中填入您感興趣的關鍵字。
    -   若要追蹤 iPhone 15 Pro 和任何徵求文，可以這樣設定：
        ```javascript
        const KEYWORDS = ["iphone 15 pro", "徵求"];
        ```
    -   如果**不想進行任何篩選**，希望所有新文章都通知，請將陣列清空：
        ```javascript
        const KEYWORDS = [];
        ```

### 步驟 4：設定觸發器 (定時執行)

1.  在 Apps Script 編輯器左方的選單中，點擊鬧鐘圖示的「觸發條件」。
2.  在右下角點擊「+ 新增觸發條件」。
3.  在跳出的視窗中，進行以下設定：
    -   **要執行的功能選擇**：`main`
    -   **選取應執行的部署作業**：`Head`
    -   **選取活動來源**：`時間驅動`
    -   **選取時間型觸發條件類型**：`分鐘計時器`
    -   **選取分鐘間隔**：建議選擇 `每 5 分鐘` 或 `每 10 分鐘`。（頻率過高可能被 PTT 阻擋）
4.  點擊「儲存」。
5.  此時 Google 會要求您授權。請選擇您的 Google 帳號，並在「不安全」的警告頁面中，點擊「進階」，然後選擇「前往『(您的專案名稱)』(不安全)」，並同意所有權限。這是因為此腳本未經 Google 官方驗證，屬於正常現象。

## 🎉 大功告成！

完成以上設定後，您的 PTT 監控機器人就正式上線了！它會根據您設定的時間間隔，自動在背景執行，並在發現符合條件的新文章時，第一時間發送到您的 Discord。

您可以隨時回到 Apps Script 專案修改 `KEYWORDS` 或其他設定。
