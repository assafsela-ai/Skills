# Browser OCR assets

The invoice workspace loads these files from the same site when a user starts OCR. One Web Worker processes the four images in order. The project does not send invoice images or extracted text to an OCR service.

These files are copied from the listed releases.

| Files | Upstream source |
| --- | --- |
| `tesseract.min.js`, `worker.min.js` and their notices | [tesseract.js 7.0.0](https://www.npmjs.com/package/tesseract.js/v/7.0.0), under `dist/` |
| `tesseract-core-lstm.wasm.js` | [tesseract.js-core 7.0.0](https://www.npmjs.com/package/tesseract.js-core/v/7.0.0), the LSTM build with embedded WebAssembly |
| `eng.traineddata.gz`, `heb.traineddata.gz` | [English](https://www.npmjs.com/package/@tesseract.js-data/eng/v/1.0.0) and [Hebrew](https://www.npmjs.com/package/@tesseract.js-data/heb/v/1.0.0) 1.0.0 packages, under `4.0.0_best_int/` |

License files are reproduced beside the assets. The language data comes from [naptha/tessdata](https://github.com/naptha/tessdata) and the [upstream trained models](https://github.com/tesseract-ocr/tessdata_best).
