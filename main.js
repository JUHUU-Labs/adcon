
require('dotenv').config()
const puppeteer = require('puppeteer');



(async () => {
    // Launch a headless browser
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();

    // Navigate to the login page
    await page.goto('https://host01.adcon.at/secure/common/main.vm');
    console.log("Went to page")
    // Fill in the login form
    await page.type('input[name="j_username"]', process.env.FH_USERNAME);
    console.log("Went j_username page")

    await page.type('input[name="j_password"]', process.env.FH_PASSWORD);
    console.log("Went j_password page")
    // Submit the form
    await page.click('input[id="login"]');
    console.log("Went input page")
    // Wait for a response indicating successful login
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' }); // You can customize the condition as needed

    console.log("Went body page")
    // Get the cookie from the page
    const cookies = await page.cookies();
    const cookie = cookies.find(c => c.name === 'JSESSIONID');

    if (!cookie) {
        console.error('Failed to obtain the cookie.');
        await browser.close();
        return;
    }

    const apiUrl = 'https://host01.adcon.at/values2?action=getValuesJson&startDate=1701212400&endDate=1701817200&width=1162&panelId=105191&tagNodeIds=105105,105120,105117,105130,105109,105138,105101,-1';

// Assuming you have the 'cookie' object containing the cookie information
    const cookieHeader = `${cookie.name}=${cookie.value}`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            Cookie: cookieHeader,
        },
        agent: new (require('https').Agent)({ rejectUnauthorized: false }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);
        })
        .catch(error => {
            console.error('Error:', error.message, error);
        }).finally(() => {
        // Close the browser
        browser.close();
    });



})();
