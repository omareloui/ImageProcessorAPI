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
    const image = await (
      await fetch(`/api/images/${originalImageName}`)
    ).json();
    this.image = image;
    this.previewImage = image.link;
  },

  async updatePreviewImage(newLink) {
    await loadImage(newLink);
    this.previewImage = newLink;
  },
});

Alpine.store("resizeForm", {
  link: null,

  onSubmit(e) {
    const formData = new FormData(e.target);
    formData.append("image", originalImageName);
    const options = Object.fromEntries(formData.entries());
    this.updateImage(options);
  },

  updateImage(options) {
    const link = this.generateLink(options);
    this.link = link;

    Alpine.store("image").updatePreviewImage(link);
  },

  generateLink({
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
  }) {
    // TODO: make it work without having to specify the height or width (needs some work in backend first)

    width = parseInt(width);
    height = parseInt(height);

    if (!width && !height) return Alpine.store("image").image.link;

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
});
