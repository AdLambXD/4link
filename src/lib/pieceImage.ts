import { MAX_BOARD_DATA_URL_LENGTH } from '../board';
import { MAX_PIECE_DATA_URL_LENGTH } from '../pieces';

export const MAX_PIECE_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_BOARD_UPLOAD_BYTES = 12 * 1024 * 1024;

const PIECE_OUTPUT_SIZE = 256;
const BOARD_OUTPUT_SIZE = 1024;

interface SquareImageOptions {
  /** 输出正方形边长。 */
  size: number;
  /** 原图大小上限（字节）。 */
  maxBytes: number;
  /** 输出 data URL 长度上限（字符）。 */
  maxLength: number;
  /** 依次尝试的 WebP 质量。 */
  qualities: readonly number[];
  /** 原图过大时的提示语。 */
  tooLargeMessage: string;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('无法读取这张图片'));
    image.src = url;
  });
}

/**
 * 把用户图片裁成正方形并压缩，转成可放进 localStorage 的 data URL。
 * 使用 cover 裁切，保留图片中心。
 */
async function fileToSquareDataUrl(
  file: File,
  options: SquareImageOptions,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件（PNG / JPG / WebP）');
  }
  if (file.size > options.maxBytes) {
    throw new Error(options.tooLargeMessage);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error('图片尺寸无效');
    }

    const size = options.size;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('当前浏览器无法处理图片');

    const scale = Math.max(
      size / image.naturalWidth,
      size / image.naturalHeight,
    );
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.clearRect(0, 0, size, size);
    context.drawImage(
      image,
      (size - width) / 2,
      (size - height) / 2,
      width,
      height,
    );

    for (const quality of options.qualities) {
      const dataUrl = canvas.toDataURL('image/webp', quality);
      if (
        dataUrl.startsWith('data:image/webp') &&
        dataUrl.length <= options.maxLength
      ) {
        return dataUrl;
      }
    }

    // 极少数浏览器不支持 WebP 编码，回退到 PNG。
    const png = canvas.toDataURL('image/png');
    if (png.length <= options.maxLength) return png;

    throw new Error('图片太复杂，请换一张更简单的图片');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** 棋子图片：256×256，PNG / JPG / WebP，原图最大 8 MB。 */
export function imageFileToDataUrl(file: File): Promise<string> {
  return fileToSquareDataUrl(file, {
    size: PIECE_OUTPUT_SIZE,
    maxBytes: MAX_PIECE_UPLOAD_BYTES,
    maxLength: MAX_PIECE_DATA_URL_LENGTH,
    qualities: [0.86, 0.72, 0.58],
    tooLargeMessage: '图片不能超过 8 MB',
  });
}

/** 棋盘背景：1024×1024，原图最大 12 MB。 */
export function boardImageFileToDataUrl(file: File): Promise<string> {
  return fileToSquareDataUrl(file, {
    size: BOARD_OUTPUT_SIZE,
    maxBytes: MAX_BOARD_UPLOAD_BYTES,
    maxLength: MAX_BOARD_DATA_URL_LENGTH,
    qualities: [0.82, 0.68, 0.54, 0.4],
    tooLargeMessage: '棋盘背景不能超过 12 MB',
  });
}
