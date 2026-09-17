const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const previewUrl = process.env.PREVIEW_URL ?? "http://127.0.0.1:1420/";
const outputDir = path.resolve(__dirname, "../.verification");

async function verifyViewport(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(previewUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("canvas", { timeout: 15_000 });
  await page.waitForTimeout(500);

  const screenshotPath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ fullPage: true, path: screenshotPath });

  const metrics = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      return { hasCanvas: false };
    }

    const rect = canvas.getBoundingClientRect();
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) {
      return {
        hasCanvas: true,
        hasContext: false,
        height: rect.height,
        width: rect.width
      };
    }

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const sampleWidth = Math.min(18, width);
    const sampleHeight = Math.min(18, height);
    const pixels = new Uint8Array(sampleWidth * sampleHeight * 4);
    const samplePoints = [
      [0.38, 0.36],
      [0.5, 0.36],
      [0.62, 0.36],
      [0.38, 0.5],
      [0.5, 0.5],
      [0.62, 0.5],
      [0.38, 0.64],
      [0.5, 0.64],
      [0.62, 0.64]
    ];

    let nonBlackPixels = 0;
    for (const [xRatio, yRatio] of samplePoints) {
      gl.readPixels(
        Math.max(0, Math.floor(width * xRatio - sampleWidth / 2)),
        Math.max(0, Math.floor(height * yRatio - sampleHeight / 2)),
        sampleWidth,
        sampleHeight,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels
      );

      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index] + pixels[index + 1] + pixels[index + 2] > 32 && pixels[index + 3] > 0) {
          nonBlackPixels += 1;
        }
      }
    }

    const toolbar = document.querySelector(".viewer-toolbar")?.getBoundingClientRect();
    const header = document.querySelector(".app-header")?.getBoundingClientRect();
    const overlapsHeader =
      Boolean(toolbar && header) &&
      toolbar.left < header.right &&
      toolbar.right > header.left &&
      toolbar.top < header.bottom &&
      toolbar.bottom > header.top;

    return {
      drawingBufferHeight: height,
      drawingBufferWidth: width,
      hasCanvas: true,
      hasContext: true,
      height: rect.height,
      nonBlackPixels,
      overlapsHeader,
      width: rect.width
    };
  });

  if (!metrics.hasCanvas || !metrics.hasContext) {
    throw new Error(`${name}: WebGL canvas was not available`);
  }

  if (metrics.width < 300 || metrics.height < 300) {
    throw new Error(`${name}: canvas is too small (${metrics.width}x${metrics.height})`);
  }

  if (metrics.nonBlackPixels < 8) {
    throw new Error(`${name}: canvas samples appear blank`);
  }

  if (metrics.overlapsHeader) {
    throw new Error(`${name}: viewer toolbar overlaps the app header`);
  }

  return { metrics, screenshotPath };
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  try {
    const desktop = await verifyViewport(page, "scaffold-desktop", { width: 1440, height: 920 });
    const mobile = await verifyViewport(page, "scaffold-mobile", { width: 390, height: 844 });

    if (consoleErrors.length > 0) {
      throw new Error(`browser console errors:\n${consoleErrors.join("\n")}`);
    }

    console.log(
      JSON.stringify(
        {
          desktop,
          mobile,
          previewUrl
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
