const maxFileSize = 20 * 1024 * 1024;
const maxSourcePixels = 40_000_000;
const maxOutputSide = 2800;
const rotation = -Math.PI / 30;

function canvasAt(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("This browser could not create a canvas for the image.");
  context.fillStyle = "white";
  context.fillRect(0, 0, width, height);
  return { canvas, context };
}

export function pngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create a PNG from this image.")), "image/png");
  });
}

export async function openInvoice(file) {
  if (file.size > maxFileSize) throw new Error("Choose a PNG or JPEG file under 20 MB.");
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => header[index] === byte);
  const jpeg = header[0] === 255 && header[1] === 216 && header[2] === 255;
  if (!png && !jpeg) throw new Error("Choose a PNG or JPEG invoice image.");

  // Use an explicit media type because some file pickers leave File.type empty.
  const url = URL.createObjectURL(new Blob([file], { type: png ? "image/png" : "image/jpeg" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => { throw new Error("This invoice image could not be opened. Try another PNG or JPEG."); });
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (Math.min(width, height) < 100) throw new Error("Choose an invoice at least 100 pixels wide and tall.");
    if (width * height > maxSourcePixels) throw new Error("This invoice is larger than 40 megapixels. Resize it and try again.");
    const scale = Math.min(1, maxOutputSide / Math.max(width, height));
    const { canvas, context } = canvasAt(Math.round(width * scale), Math.round(height * scale));
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { canvas, resized: scale < 1 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function inPixels(box, canvas) {
  const [left, top, right, bottom] = box.map((value, index) =>
    Math.round(value * (index % 2 === 0 ? canvas.width : canvas.height) / 100));
  return [Math.min(left, canvas.width - 1), Math.min(top, canvas.height - 1),
    Math.max(1, right - left), Math.max(1, bottom - top)];
}

function stamp(source, box) {
  const { canvas, context } = canvasAt(source.width, source.height);
  const [x, y, width, height] = inPixels(box, source);
  context.drawImage(source, 0, 0);
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.fillStyle = "rgba(182, 26, 48, 0.34)";
  context.fillRect(x, y, width, height);
  context.strokeStyle = "rgba(160, 14, 39, 0.82)";
  context.lineWidth = Math.max(1, Math.min(width, height) / 27);
  context.strokeRect(x, y, width, height);
  context.font = Math.max(1, Math.min(height / 2, width / 5.5)) + "px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(120, 12, 34, 0.78)";
  context.fillText("RECEIVED", x + width / 2, y + height / 2, width * 0.9);
  return canvas;
}

function tilt(source) {
  const cosine = Math.abs(Math.cos(rotation));
  const sine = Math.abs(Math.sin(rotation));
  const width = Math.ceil(source.width * cosine + source.height * sine);
  const height = Math.ceil(source.height * cosine + source.width * sine);
  const { canvas, context } = canvasAt(width, height);
  context.translate(width / 2, height / 2);
  context.rotate(rotation);
  context.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
}

function blur(source, box) {
  const { canvas, context } = canvasAt(source.width, source.height);
  const [x, y, width, height] = inPixels(box, source);
  const factor = Math.max(3, Math.round(height / 5));
  const small = canvasAt(Math.max(1, Math.round(width / factor)), Math.max(1, Math.round(height / factor)));
  small.context.imageSmoothingQuality = "high";
  small.context.drawImage(source, x, y, width, height, 0, 0, small.canvas.width, small.canvas.height);
  context.drawImage(source, 0, 0);
  context.imageSmoothingQuality = "high";
  context.drawImage(small.canvas, x, y, width, height);
  return canvas;
}

export async function createVariants(source, regions, cleanBlob) {
  const result = { clean: { blob: cleanBlob, size: [source.width, source.height] } };
  const transforms = {
    stamp: () => stamp(source, regions.stamp),
    tilt: () => tilt(source),
    blur: () => blur(source, regions.blur),
  };
  for (const [id, transform] of Object.entries(transforms)) {
    const canvas = transform();
    try {
      result[id] = { blob: await pngBlob(canvas), size: [canvas.width, canvas.height] };
    } finally {
      canvas.width = 0;
    }
  }
  return result;
}
