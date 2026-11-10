import html
import re
from typing import Optional


def strip_html(text: Optional[str]) -> Optional[str]:
    """Convert HTML content (e.g. from rich text / WYSIWYG editors) to clean plain text.

    - Replaces block endings (</p>, </div>, </h*>, <br>) with newlines
    - Strips all HTML tags
    - Unescapes HTML entities (&amp;, &quot;, &nbsp;, &#39;, etc.)
    - Normalizes linebreaks and trims excess whitespace
    """
    if not text:
        return text

    # Convert block endings and linebreaks to appropriate newlines
    t = re.sub(r'</(?:p|div|h[1-6])>', '\n\n', text, flags=re.IGNORECASE)
    t = re.sub(r'</li>', '\n', t, flags=re.IGNORECASE)
    t = re.sub(r'<br\s*/?>', '\n', t, flags=re.IGNORECASE)

    # Strip any remaining tags
    t = re.sub(r'<[^>]+>', '', t)

    # Unescape HTML entities
    t = html.unescape(t)

    # Replace non-breaking spaces with standard space
    t = t.replace('\xa0', ' ')

    # Clean whitespace line by line and collapse excessive empty lines (max 2 consecutive newlines)
    lines = [line.strip() for line in t.split('\n')]
    cleaned_lines = []
    prev_empty = False
    for line in lines:
        if line:
            cleaned_lines.append(line)
            prev_empty = False
        elif not prev_empty and cleaned_lines:
            cleaned_lines.append('')
            prev_empty = True

    return '\n'.join(cleaned_lines).strip()
