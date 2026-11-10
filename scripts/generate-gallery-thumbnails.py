"""Run with Pillow after adding gallery items; originals remain unchanged."""
from pathlib import Path
from PIL import Image, ImageOps
import re
root=Path(__file__).resolve().parents[1]
p=root/'js/gallery-data.js'
s=p.read_text()
pattern=r'(?P<key>"?src"?\s*:\s*)(?P<q>["\'])(?P<src>\.\./assets/[^"\']+)(?P=q)(?:,\s*"?thumb"?\s*:\s*["\'][^"\']+["\'])?'
count=total=original=0

def convert(m):
 global count,total,original
 source=root/m['src'][3:]
 if not source.is_file():raise FileNotFoundError(source)
 dest=source.with_name(source.stem+'.thumb.webp')
 if not dest.exists() or dest.stat().st_mtime<source.stat().st_mtime:
  im=ImageOps.exif_transpose(Image.open(source)).convert('RGB')
  im.thumbnail((640,960),Image.Resampling.LANCZOS)
  im.save(dest,'WEBP',quality=82,method=6)
 count+=1;total+=dest.stat().st_size;original+=source.stat().st_size
 return m['key']+m['q']+m['src']+m['q']+', "thumb": "../'+dest.relative_to(root).as_posix()+'"'
# Ignore documentation examples before the actual data array.
start=s.index('window.GALLERY_ITEMS = [')
s=s[:start]+re.sub(pattern,convert,s[start:])
p.write_text(s)
print(f'{count} items: originals {original/1024**2:.1f} MB, thumbnails {total/1024**2:.1f} MB')
