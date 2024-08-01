const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require('fs');
const path = require('path');
const {Collection} = require('./collection');

async function example() {
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options())
    .build();
  try {
    await driver.get("http://www.google.com");

    let searchBox = await driver.findElement(By.name("q"));

    await searchBox.sendKeys("amazon", Key.RETURN);

    await driver.wait(until.titleContains("amazon"), 1000);

    await driver.findElement(By.partialLinkText("Amazon.com")).click();

    await driver.wait(until.titleContains("Amazon.com"), 1000);

    let searchBoxAmazon = await driver.findElement(By.id("twotabsearchtextbox"));

    await searchBoxAmazon.sendKeys("laptop", Key.RETURN);

    await driver.wait(until.titleContains("laptop"), 10000);

    let file = 0;
    for (let i = 1; i <= 10; i++) {
      await driver.wait(until.elementLocated(By.className("puis-card-container")), 10000);
      let products = await driver.findElements(By.className("puis-card-container"));

      for (let j = 0; j < products.length; j++) {
        let product = products[j];
        const data = await product.getAttribute('outerHTML');

        let filePath = path.join('data', `laptop_${file}.html`);

        fs.writeFileSync(filePath,  data);
        console.log(`File created: ${filePath}`);
        file += 1;
      }

      try {
        await driver.executeScript(`
          var navCover = document.getElementById('nav-cover');
          if (navCover) {
            navCover.style.display = 'none';
          }
        `);

        let nextButton = await driver.wait(
          until.elementLocated(
            By.xpath(`//a[contains(@aria-label, "Go to next page, page ${i + 1}")]`)
          ),
          10000
        );
        await driver.executeScript("arguments[0].scrollIntoView();", nextButton);
        await nextButton.click();
        await driver.sleep(2500);
        // await driver.wait(until.elementLocated(By.className("puis-card-container")), 10000);
      } catch (err) {
        console.log("Next button not found or could not be clicked:", err);
        break;
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    // Close the browser
    await driver.quit();
    await Collection()
  }
}

example();
