import "alpine";

import { loadImage } from "./utils.js";

const originalImageName = location.pathname.split("/")[1];

document.title = `Image Processor | ${originalImageName}`;

Alpine.store("image", {
  name: originalImageName,
  ext: originalImageName.match(/\.[^.]+$/)[0].split(".")[1],
  image: null,
  previewImage: null,

  async getImage() {
    const res = await fetch(`/api/images/${originalImageName}`);
    const image = await res.json();
    this.image = image;
    this.previewImage = image.link;
  },

  async updatePreviewImage(newLink) {
    await loadImage(newLink);
    this.previewImage = newLink;
  },
});

Alpine.store("operateForm", {
  link: null,
  error: null,

  async onSubmit(e) {
    this.error = null;
    const formData = new FormData(e.target);
    formData.append("image", originalImageName);
    const options = Object.fromEntries(formData.entries());
    this.updateImage(options);
  },

  async updateImage(options) {
    const link = this.generateLink(options);
    this.link = link;

    try {
      await this.validateFromSever(link);
      Alpine.store("image").updatePreviewImage(link);
    } catch (e) {
      this.error = e.message;
    }
  },

  generateLink(options) {
    let {
      image,
      width,
      height,
      blur,
      median,
      rotate,
      flip,
      flop,
      negate,
      grayscale,
      filetype,
    } = options;

    width = parseInt(width);
    height = parseInt(height);

    const hasOperations = this.validateHasSomeOperation(options, [
      "width",
      "height",
      "flip",
      "flop",
      "blur",
      "grayscale",
      "median",
      "negate",
      "rotate",
    ]);

    if (!hasOperations && filetype === Alpine.store("image").ext)
      return Alpine.store("image").image.link;

    let link = `/api/operate?filename=${image}`;

    if (width) link += `&w=${width}`;
    if (height) link += `&h=${height}`;

    if (parseInt(blur)) link += `&b=${blur}`;
    if (parseInt(median)) link += `&m=${median}`;
    if (parseInt(rotate)) link += `&r=${rotate}`;

    if (flip) link += "&fx";
    if (flop) link += "&fy";
    if (negate) link += "&n";
    if (grayscale) link += "&g";

    if (filetype && filetype !== Alpine.store("image").ext)
      link += `&ext=${filetype}`;

    return link;
  },

  validateHasSomeOperation(options, operations) {
    const keys = Object.keys(options);
    return operations.some(
      o => keys.includes(o) && options[o] && options[o] !== "0"
    );
  },

  async validateFromSever(link) {
    const res = await fetch(link);
    if (res.status >= 400) throw new Error(await res.text());
  },
});
