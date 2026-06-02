// Produce a cropped image (base64 PNG) from a source image + react-easy-crop
// pixel-crop area. Renders at high resolution for crisp output.

export default function getCroppedImg(imageSrc, pixelCrop, maxWidth = 1200) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const scale = pixelCrop.width > maxWidth ? maxWidth / pixelCrop.width : 1;
      const outW = Math.round(pixelCrop.width * scale);
      const outH = Math.round(pixelCrop.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outW,
        outH
      );

      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}
