import fetch from "node-fetch";
import cheerio from "cheerio";
import fs from "fs";

const parsedArr = [];
const pageLimit = 2536;
let pageCount = 1;
let resultCount = 0;
let urlRoot = `https://xkcd.com/`;
const outputFile = "xkcd_scrape.json";

const getRawData = (url) => {
  return fetch(url)
    .then((response) => response.text())
    .then((data) => {
      return data;
    });
};

console.log(`Scraping of ${urlRoot} initiated...`);

const getXKCDContent = async (url) => {
  try {
    const rawData = await getRawData(url);
    const $ = cheerio.load(rawData);
    resultCount++;
    pageCount++;
    const count = resultCount;
    const dataTitle = $("#ctitle").text();
    const dataHover = $("div>img").attr("title");
    const dataImage = $("div>img").attr("src");
    const currentUrl = $('meta[property="og:url"]').attr("content");
    const dataParse = {
      comic_number: count,
      comic_title: dataTitle,
      hover_text: dataHover,
      image_src: `https:${dataImage}`,
    };
    parsedArr.push(dataParse);
    const nextPageUrl = `${urlRoot + pageCount}`;
    console.log(` Scraping: ${currentUrl}`);
    console.log(parsedArr);
    if (pageCount > pageLimit) {
      exportParsedArr(parsedArr);
      return false;
    }
    getXKCDContent(nextPageUrl);
  } catch (error) {
    exportParsedArr(parsedArr);
    console.error(error);
  }
};

const exportParsedArr = (arr) => {
  fs.writeFile(outputFile, JSON.stringify(parsedArr, null, 4), (err) => {
    if (err) {
      console.log(err);
    }
    console.log(
      `${parsedArr.length} results exported successfully to ${outputFile}`
    );
  });
};
getXKCDContent(`${urlRoot + pageCount}`);
