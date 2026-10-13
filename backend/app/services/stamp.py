"""
Rubber-stamp renderer for invoices and receipts.

Produces a PNG that mimics the physical Allbound Travel Services Ltd rubber stamp
(double rounded border, brand mark, company name, dynamic status / document
number / date, contact lines). Ink colours follow the original: blue ink for the
frame and text, red ink for the date line.
"""
import base64
import hashlib
import io
import random
from datetime import date, datetime
from pathlib import Path
from typing import Optional, Union

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
BRAND_MARK = ASSETS_DIR / "brand_mark.png"

BLUE_INK = (31, 58, 147)
RED_INK = (196, 40, 40)

COMPANY_NAME = "ALLBOUND"
COMPANY_SUBTITLE = "TRAVEL SERVICES LTD"
CONTACT_LINES = ("TEL: +256 782 594 008", "P.O.BOX 173469 KAMPALA GPO")

_BOLD_FONTS = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "DejaVuSans-Bold.ttf",
    "arialbd.ttf",
)

# Supported statuses -> label shown on the stamp
STATUS_LABELS = {
    "invoice": "INVOICE",
    "receipt": "RECEIPT",
    "paid": "PAID",
    "received": "RECEIVED",
    "void": "VOID",
}

SCALE = 2  # render at 2x, downsample for smooth edges
WIDTH, HEIGHT = 560, 400


def _font(size: int) -> ImageFont.FreeTypeFont:
    for path in _BOLD_FONTS:
        try:
            return ImageFont.truetype(path, size * SCALE)
        except OSError:
            continue
    return ImageFont.load_default(size * SCALE)


def _text_centered(draw, cx, y, text, font, fill, tracking=0):
    """Draw text centred on cx with optional letter-spacing. Returns text height."""
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * SCALE * (len(text) - 1)
    x = cx - total / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += w + tracking * SCALE
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[3] - bbox[1]


def _format_date(value: Optional[Union[date, datetime]]) -> str:
    value = value or datetime.now()
    return value.strftime("%d %b %Y").upper().lstrip("0")


def render_stamp_png(
    status: str = "receipt",
    document_number: Optional[str] = None,
    stamp_date: Optional[Union[date, datetime]] = None,
    rotation: float = -2.0,
) -> bytes:
    """
    Render the stamp and return PNG bytes (transparent background).

    status: 'invoice' | 'receipt' | 'paid' | 'received' | 'void' (or any custom text)
    document_number: e.g. 'INV-2026-0042' / 'RCT-2026-0017'
    stamp_date: date shown in red ink (defaults to today)
    rotation: degrees of tilt, as if stamped by hand
    """
    label = STATUS_LABELS.get(status.lower(), status.upper())
    date_text = _format_date(stamp_date)
    W, H = WIDTH * SCALE, HEIGHT * SCALE

    ink = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ink)

    # Double frame (outer thick, inner thin) like the original rubber die
    d.rounded_rectangle((8 * SCALE, 8 * SCALE, W - 8 * SCALE, H - 8 * SCALE),
                        radius=18 * SCALE, outline=BLUE_INK, width=5 * SCALE)
    d.rounded_rectangle((20 * SCALE, 20 * SCALE, W - 20 * SCALE, H - 20 * SCALE),
                        radius=10 * SCALE, outline=BLUE_INK, width=2 * SCALE)

    cx = W / 2

    # Header: brand mark + company name
    mark_size = 74 * SCALE
    if BRAND_MARK.exists():
        mark = Image.open(BRAND_MARK).convert("RGBA").resize((mark_size, mark_size), Image.LANCZOS)
        tinted = Image.new("RGBA", mark.size, BLUE_INK + (0,))
        # Solid ink for the darker circle; the lighter calendar glyph stays blank
        luminance = mark.convert("L").point(lambda v: 255 if v < 165 else 0)
        tinted.putalpha(ImageChops.multiply(luminance, mark.split()[3]))
        ink.alpha_composite(tinted, (46 * SCALE, 40 * SCALE))

    name_font = _font(50)
    sub_font = _font(19)
    _text_centered(d, cx + 52 * SCALE, 36 * SCALE, COMPANY_NAME, name_font, BLUE_INK, tracking=2)
    _text_centered(d, cx + 52 * SCALE, 98 * SCALE, COMPANY_SUBTITLE, sub_font, BLUE_INK, tracking=1)

    # Divider
    d.line((46 * SCALE, 134 * SCALE, W - 46 * SCALE, 134 * SCALE), fill=BLUE_INK, width=2 * SCALE)

    # Status band (blue)
    _text_centered(d, cx, 146 * SCALE, label, _font(38), BLUE_INK, tracking=6)

    # Document number
    y = 200
    if document_number:
        _text_centered(d, cx, y * SCALE, f"NO. {document_number}", _font(22), BLUE_INK, tracking=2)
        y += 38

    # Date (red ink, like the original)
    _text_centered(d, cx, (y + 4) * SCALE, date_text, _font(40), RED_INK, tracking=5)

    # Contact lines
    contact_font = _font(18)
    base_y = H // SCALE - 84
    for i, line in enumerate(CONTACT_LINES):
        _text_centered(d, cx, (base_y + i * 28) * SCALE, line, contact_font, BLUE_INK, tracking=1)

    # --- Rubber-stamp ink texture: seeded speckle so it is stable per document ---
    seed = hashlib.sha256(f"{status}|{document_number}|{date_text}".encode()).digest()
    rng = random.Random(seed)
    alpha = ink.split()[3]
    noise = Image.new("L", (W, H), 255)
    nd = ImageDraw.Draw(noise)
    for _ in range(2600):
        x, y_ = rng.randrange(W), rng.randrange(H)
        r = rng.choice((1, 1, 2, 2, 3)) * SCALE // 2
        nd.ellipse((x - r, y_ - r, x + r, y_ + r), fill=rng.randrange(0, 120))
    noise = noise.filter(ImageFilter.GaussianBlur(0.6 * SCALE))
    alpha = ImageChops.multiply(alpha, noise)
    # Slight ink bleed + uneven pressure
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.5 * SCALE)).point(lambda v: min(255, int(v * 1.08)))
    ink.putalpha(alpha.point(lambda v: int(v * 0.92)))

    ink = ink.rotate(rotation, resample=Image.BICUBIC, expand=True)
    ink = ink.resize((ink.width // SCALE, ink.height // SCALE), Image.LANCZOS)

    buf = io.BytesIO()
    ink.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def stamp_cid(document_number: Optional[str], status: str) -> str:
    """Stable content-id used when embedding the stamp inline in an email."""
    slug = "".join(c.lower() if c.isalnum() else "-" for c in f"{status}-{document_number or 'stamp'}")
    return f"stamp-{slug}"


def stamp_inline_image(
    status: str,
    document_number: Optional[str] = None,
    stamp_date: Optional[Union[date, datetime]] = None,
) -> dict:
    """ZeptoMail `inline_images` entry for the stamp (reference with <img src="cid:...">)."""
    png = render_stamp_png(status, document_number, stamp_date)
    return {
        "mime_type": "image/png",
        "content": base64.b64encode(png).decode(),
        "cid": stamp_cid(document_number, status),
    }


def stamp_img_html(document_number: Optional[str], status: str, width: int = 240) -> str:
    """HTML <img> block for use inside email bodies."""
    cid = stamp_cid(document_number, status)
    return (
        f'<div style="text-align:right; margin: 10px 0 0;">'
        f'<img src="cid:{cid}" width="{width}" alt="Allbound Travel Services Ltd — {status.upper()}" '
        f'style="display:inline-block; max-width:100%; height:auto;" /></div>'
    )
