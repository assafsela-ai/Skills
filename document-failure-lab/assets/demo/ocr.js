import { extractInvoiceFields } from "./invoice-fields.js";
import { variantIds } from "./results.js";

const assets = new URL("../ocr/", import.meta.url);
let library;

function loadEngine() {
  library ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = new URL("tesseract.min.js", assets);
    script.onload = () => resolve(globalThis.Tesseract);
    script.onerror = () => {
      script.remove();
      reject(new Error("Could not load the OCR engine. Check your connection and try again."));
    };
    document.head.append(script);
  }).catch((error) => {
    library = undefined;
    throw error;
  });
  return library;
}

export async function recognizeVariants(images, { onStep, onComplete }) {
  const engine = await loadEngine();
  // A single worker avoids loading the language data four times and limits memory use.
  let worker;
  let rejectWorker;
  const workerError = new Promise((resolve, reject) => { rejectWorker = reject; });
  const deadline = setTimeout(() => rejectWorker(new Error("OCR took too long.")), 180_000);
  try {
    worker = await Promise.race([
      engine.createWorker(["eng", "heb"], 1, {
        workerPath: new URL("worker.min.js", assets).href,
        corePath: new URL("tesseract-core-lstm.wasm.js", assets).href,
        langPath: assets.href,
        workerBlobURL: false,
        cacheMethod: "none",
        errorHandler: rejectWorker,
      }),
      workerError,
    ]);

    const variants = {};
    for (const id of variantIds) {
      onStep(id);
      const result = await Promise.race([worker.recognize(images[id].blob), workerError]);
      variants[id] = extractInvoiceFields(result.data.text);
      onComplete();
    }
    return { source: "measured", variants };
  } finally {
    clearTimeout(deadline);
    if (worker) await worker.terminate();
  }
}
