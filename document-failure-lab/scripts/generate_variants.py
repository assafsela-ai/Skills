"""Create a local invoice test run from one PNG or JPEG."""

import argparse
import shutil
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

from lab_format import VARIANTS, object_at, read_fields, read_json, write_json


ANGLE = 6
DEFAULT_OUTPUT = Path("output/document-failure-lab")


def read_image(path):
    with Image.open(path, formats=["PNG", "JPEG"]) as source:
        if getattr(source, "n_frames", 1) != 1:
            raise ValueError("The input must be a single PNG or JPEG image")
        oriented = ImageOps.exif_transpose(source).convert("RGBA")
        white = Image.new("RGBA", oriented.size, "white")
        return Image.alpha_composite(white, oriented).convert("RGB")


def read_region(regions, name, size):
    box = regions.get(name)
    if not isinstance(box, list) or len(box) != 4 or any(type(edge) is not int for edge in box):
        raise ValueError(f"Region {name!r} needs four pixel coordinates in [left, top, right, bottom] order")
    left, top, right, bottom = box
    width, height = size
    if not (0 <= left < right <= width and 0 <= top < bottom <= height):
        raise ValueError(f"Region {name!r} is outside the {width} × {height} image or has no area")
    return box


def stamp_image(image, box):
    region = image.crop(box).convert("RGBA")
    width, height = region.size
    ink = Image.new("RGBA", region.size)
    draw = ImageDraw.Draw(ink)
    draw.rectangle((0, 0, width - 1, height - 1), fill=(182, 26, 48, 85))
    if width >= 8 and height >= 8:
        draw.rectangle((1, 1, width - 2, height - 2), outline=(160, 14, 39, 200), width=2)
    size = min(height // 2, width // 6)
    if size >= 8:
        font = ImageFont.load_default(size=size)
        draw.text((width // 2, height // 2), "RECEIVED", font=font, anchor="mm", fill=(120, 12, 34, 190))
    stamped = image.copy()
    stamped.paste(Image.alpha_composite(region, ink).convert("RGB"), box)
    return stamped


def blur_image(image, box, radius):
    blurred = image.copy()
    blurred.paste(image.crop(box).filter(ImageFilter.GaussianBlur(radius)), box)
    return blurred


def generate(invoice_path, case_path, output_root):
    baseline = read_image(invoice_path)
    case = object_at(read_json(case_path), "Case")
    fields = read_fields(case.get("fields"))
    regions = object_at(case.get("regions"), "regions")
    stamp_box = read_region(regions, "stamp", baseline.size)
    blur_box = read_region(regions, "blur", baseline.size)
    radius = max(1, (blur_box[3] - blur_box[1]) / 6)

    output_root.mkdir(parents=True, exist_ok=True)
    run = Path(tempfile.mkdtemp(prefix="run-", dir=output_root.resolve()))
    try:
        baseline.save(run / "clean.png")
        stamp_image(baseline, stamp_box).save(run / "stamp.png")
        baseline.rotate(
            ANGLE, resample=Image.Resampling.BICUBIC, expand=True, fillcolor="white"
        ).save(run / "tilt.png")
        blur_image(baseline, blur_box, radius).save(run / "blur.png")
        effects = {
            "clean": {},
            "stamp": {"box": stamp_box},
            "tilt": {"counterclockwise_degrees": ANGLE},
            "blur": {"box": blur_box, "radius_pixels": radius},
        }
        write_json(run / "manifest.json", {
            "baseline_size": list(baseline.size),
            "fields": fields,
            "variants": [
                {"id": variant, "file": f"{variant}.png", "change": description, **effects[variant]}
                for variant, description in VARIANTS.items()
            ],
        })
        write_json(run / "results-template.json", {
            "source": "measured",
            "variants": dict.fromkeys(VARIANTS),
        })
    except Exception:
        shutil.rmtree(run, ignore_errors=True)
        raise
    return run


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("invoice", type=Path, help="Single PNG or JPEG invoice")
    parser.add_argument("case", type=Path, help="JSON with expected values and target regions")
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    try:
        run = generate(args.invoice, args.case, args.output_root)
    except (OSError, ValueError, Image.DecompressionBombError) as error:
        print(f"Generation failed: {error}", file=sys.stderr)
        return 1

    print(run)
    return 0


if __name__ == "__main__":
    sys.exit(main())
