const puppeteer = require("puppeteer");

const leadId = process.argv[2];

if (!leadId) {
console.log("Please provide lead ID");
process.exit(1);
}

const url = `https://www.nomapstory.com/crm/generated_itineraries/lead_${leadId}.html`;

(async () => {

const browser = await puppeteer.launch({
headless: true,
args: ["--no-sandbox", "--disable-setuid-sandbox"]
});

const page = await browser.newPage();

await page.goto(url, {
waitUntil: "networkidle2",
timeout: 0
});

// wait for all images to load
await page.evaluate(async () => {
  const imgs = Array.from(document.images);
  await Promise.all(imgs.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = img.onerror = resolve;
    });
  }));
});


// small wait to ensure page fully renders
await new Promise(resolve => setTimeout(resolve, 2000));

const fileName = `lead_${leadId}.pdf`;

await page.pdf({
path: fileName,
format: "A4",
printBackground: true
});

await browser.close();

console.log("PDF generated:", fileName);

})();

