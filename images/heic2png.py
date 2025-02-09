import os
import glob
from PIL import Image
import pillow_heif


def heic2jpg(img_path):
    img_name = img_path.strip()[:-5]
    print(img_path, img_name)
    heif_file = pillow_heif.read_heif(img_path)
    image = Image.frombytes(
        heif_file.mode,
        heif_file.size,
        heif_file.data,
        "raw",
    )

    image.save(f"./{img_name}.png")
    os.remove(img_path)


imglst = glob.glob("*HEIC")

import glob
img_lst = glob.glob("*HEIC")
for img_path in img_lst:
    heic2jpg(img_path)
