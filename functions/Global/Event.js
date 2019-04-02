const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');
const {Payload} = require('dialogflow-fulfillment');

module.exports = {

    searchEvents:async function (agent){
        var elements = [];
        var browser;
    
        browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        });
                
          let page = await browser.newPage();
          await page.goto('https://www.cardiff.ac.uk/events/browse-events');
          await page.waitForSelector('.teaser-body');
          var result = await page.evaluate(() => {
            let value = document.querySelector('body').innerHTML;
            return value;
          });
            var data = getEventData(result);
              for (let i = 0; i < 5; i++) {
                  elements.push({
                    "title": data[i].title,
                    "image_url": data[i].img,
                    "subtitle": data[i].desc,  
                    "default_action": {
                        "type": "web_url",
                        "url": data[i].url,
                        "webview_height_ratio": "tall",
                      },   
                  },
                );
              }
               var payload = {
                "attachment":{
                "type":"template",
                "payload":{
                  "template_type":"generic",
                  "elements": elements
                    }
                  }
                }
            agent.add(new Payload(agent.FACEBOOK, payload, {sendAsMessage:true}) );
            if (browser !== null) {
                await browser.close();
            }
            return;
    },
}

function getEventData(html) {
    var datas = [];
    var $ = cheerio.load(html);
    //console.log(html);
    let text = $(".teaser.with-image").each(function(i, item) {
        //data.push($(item).find('.best-location-library-code').text());
        datas.push({
        title: $(item).find('.teaser-title').text(),
        desc: $(item).find('.teaser-body').text().split('\n')[2].trim() + " - " + $(item).find('.teaser-body > p:nth-of-type(2)').text(),
        img: $(item).find('.teaser-image > a > img').attr('srcset').split(' ')[0],
        url: $(item).find('.teaser-title > a').attr('href')}
        );
        //console.log(datas);
    });
    //console.log("data i: " + datas);
    return datas;
}
