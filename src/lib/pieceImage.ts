import { MAX_PIECE_DATA_URL_LENGTH } from '../pieces';

export const MAX_PIECE_UPLOAD_BYTES = 8 * 1024 * 1024;

const OUTPUT_SIZE = 256;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('无法读取这张图片'));
    image.src = url;
  });
}

/**
 * 把用户图片裁成正方形并压缩到 256px，转成可放进 localStorage 的 data URL。
 * 使用 cover 裁切，保留图片中心。
 */
export async function imageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件（PNG / JPG / WebP）');
  }
  if (file.size > MAX_PIECE_UPLOAD_BYTES) {
    throw new Error('图片不能超过 8 MB');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error('图片尺寸无效');
    }

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('当前浏览器无法处理图片');

    const scale = Math.max(
      OUTPUT_SIZE / image.naturalWidth,
      OUTPUT_SIZE / image.naturalHeight,
    );
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    context.drawImage(
      image,
      (OUTPUT_SIZE - width) / 2,
      (OUTPUT_SIZE - height) / 2,
      width,
      height,
    );

    for (const quality of [0.86, 0.72, 0.58]) {
      const dataUrl = canvas.toDataURL('image/webp', quality);
      if (
        dataUrl.startsWith('data:image/webp') &&
        dataUrl.length <= MAX_PIECE_DATA_URL_LENGTH
      ) {
        return dataUrl;
      }
    }

    // 极少数浏览器不支持 WebP 编码，回退到 PNG。
    const png = canvas.toDataURL('image/png');
    if (png.length <= MAX_PIECE_DATA_URL_LENGTH) return png;

    throw new Error('图片太复杂，请换一张更简单的图片');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
