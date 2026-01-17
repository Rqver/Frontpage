import puppeteer from "npm:puppeteer";

export type BrowserBundle = {
    browser: any;
    page: any;
    launchedAt: number;
};

async function launchBrowser(){
    const browser = await puppeteer.launch({
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
            ],
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on("request", (req) => {
        const resourceType = req.resourceType();
        if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
            req.abort();
        } else {
            req.continue();
        }
    });

    return {browser, page}
}


const MAX_AGE_MS = 20 * 60 * 60 * 1000;

let current: BrowserBundle | null = null;
let launching: Promise<BrowserBundle> | null = null;

async function ensureBrowser(): Promise<BrowserBundle> {
    if (launching) return launching;

    const age = current ? (Date.now() - current.launchedAt) : 0;
    const ms = Math.floor(Math.random() * (15 * 60_000 - 60_000 + 1)) + 60_000;

    const needsNew = !current || age >= MAX_AGE_MS + ms;
    if (!needsNew) return current!;

    launching = (async () => {
        if (current) {
            try { await current.browser.close(); } catch (_) {}
        }

        const { browser, page } = await launchBrowser();
        current = { browser, page, launchedAt: Date.now() };

        launching = null;
        return current;
    })();

    return launching;
}

export async function getCurrentBrowser() {
    return ensureBrowser();
}

export async function closeBrowsers(){
    if (current){
        const bundle = await getCurrentBrowser();
        await bundle?.browser.close();
    }
}

export async function gotoWithRetry(page: puppeteer.Page, url: string, { attempts = 5, timeout = 3_000, waitUntil = "domcontentloaded", delayMs = 500, } = {}) {
    let lastError: unknown;

    for (let i = 0; i < attempts; i++) {
        try {
            await page.goto(url, { waitUntil, timeout });
            return;
        } catch (err) {
            lastError = err;

            if (i < attempts - 1) {
                await new Promise(r => setTimeout(r, delayMs));
            }
        }
    }

    throw lastError;
}