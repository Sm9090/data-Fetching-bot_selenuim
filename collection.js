const { Builder, By , until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function main() {
  const dataDir = path.join(__dirname, 'data');  // Directory containing HTML files

  // Initialize Selenium WebDriver
  let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();

//   let allHrefs = [];
 let Data = {title: [] ,link : []}

  try {
    // Loop through all files in the directory
    const files = fs.readdirSync(dataDir);

    //files ko sb se pehle parse krna hai
    console.log(files ,'files')
    for (let file of files) {
        const filePath = path.join(dataDir, file);
        const fileUrl = 'file://' + filePath;
        await driver.get(fileUrl);

        // Extract data from each file
        await driver.wait(
            until.elementLocated(
              By.css(`h2`)
            ),
            10000
          );
        const h2 = await driver.findElement(By.css('h2'));
        const title = await h2.getText();
        const a = await h2.findElement(By.css('a'));
        const link = await a.getAttribute('href');

        Data.title.push(title);
        Data.link.push(`http://amazon.in/${link}`);

    }
    
    // console.log('Extracted hrefs:', allHrefs);
  } catch (err) {
    console.error('Error processing files:', err);
  } finally {
    // Close the browser
    await driver.quit();
  }

  const records = Data.title.map((title, index) => ({
    title: title,
    link: Data.link[index],
    // Assuming price is not extracted in this example
    price: 'N/A'
  }));

  const csvWriter = createCsvWriter({
    path: path.join(__dirname, 'data.csv'),
    header: [
      { id: 'title', title: 'Title' },
      { id: 'price', title: 'Price' },
      { id: 'link', title: 'Link' }
    ]
  });

  await csvWriter.writeRecords(records);
}

main();
