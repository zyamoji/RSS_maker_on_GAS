// 指定されたサイトからRSS更新情報を生成し、
// Google Spreadsheet上で配信するスクリプト

// スプレッドシートのID
var spreadSheetId = "** input spread sheet id **";
// スプレッドシート情報取得用変数
var spreadSheet;
// 範囲指定用変数
var range;
// 指定するURL
var site_for_rss = 'https://qrunch.net/entries';

// 新規記事取得関数
function myFunction() {
  // ヘッダの設定
  var headers = {"method": "GET", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:54.0) Gecko/20100101 Firefox/54.0"}
  var params = {"headers": headers };
  
  // RSS化したいサイトから情報を取得
  var html = UrlFetchApp.fetch(site_for_rss, params).getContentText();
  // 取得用正規表現
  var myRegexp = /<div class="entry">([\s\S]*?)<div class="date">([\s\S]*?)<\/div>/gi;
  // 正規表現によるマッチング実施
  var match = html.match(myRegexp);
  
  // 操作用シートの情報を取得
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  // 各記事についてさらに解析を実施
  for(var i in match) {
    // 記事タイトルの取得
    // 記事の情報を格納
    var title_str = match[i]
    // タイトルとURL取得用正規表現
    var title_re = /[\s\S]*?<div class="title">[\s\S]*?<a href="([\s\S]*?)">[\s\S]*?<h3>([\s\S]*?)<\/h3>/i;
    // 正規表現実施
    var title_and_url = title_str.match(title_re);
    // タイトルを取得
    var article_title = title_and_url[2]
    
    // URLの取得
    var article_url = title_and_url[1]
    
    // 日付の取得
    // 日付取得用正規表現
    var date_re = /[\s\S]*?<div class="date">([\s\S]*?)<\/div>/i;
    // 正規表現実施
    var article_date = title_str.match(date_re)[1]
    
    // 執筆者情報取得
    var auther = article_url.split("/")[1]
        
    // カテゴリ
    // 取得できないので、何もしない

    // 詳細情報取得
    // 詳細情報取得用正規表現
    var desc_re = /[\s\S]*?<div class="about">[\s\S]*?<p>([\s\S]*?)<\/p>/i;
    // 正規表現実施
    var article_desc = title_str.match(desc_re)[1].replace(/[\r|\r\n|\n]/g, "");
    
    // 取得したデータをスプレッドシートに転機する
    // 取得した情報を書き込む
    sheet.getRange(2+Number(i), 1).setValue(article_title);
    sheet.getRange(2+Number(i), 2).setValue("https://qrunch.net"+article_url);
    sheet.getRange(2+Number(i), 3).setValue(article_date);
    sheet.getRange(2+Number(i), 4).setValue(auther);
    sheet.getRange(2+Number(i), 5).setValue("");
    sheet.getRange(2+Number(i), 6).setValue(article_desc);
    
  }
}

// RSS情報配信用関数
function doGet() {
 // スプレッドシート取得
 spreadSheet = SpreadsheetApp.openById(spreadSheetId);
 
 // 20x20セルのデータを一度に取得しておく
 range = spreadSheet.getActiveSheet().getRange(2, 1, 20, 20);
 
 // テンプレート呼び出し(rssTemplate.html)
 var output = HtmlService.createTemplateFromFile('rssTemplate');
 var result= output.evaluate();
 
// コンテントタイプ指定
 return ContentService.createTextOutput(result.getContent())
 .setMimeType(ContentService.MimeType.XML);
}

// 行データ取得
function getRowData(rowNum){
 return range.getValues()[rowNum];
}

// シートのタイトル取得
function getSpreadSheetTitle(){
 return spreadSheet.getName();
}

// シートのリンク取得
function getSpreadSheerLink(){
 return spreadSheet.getUrl();
}