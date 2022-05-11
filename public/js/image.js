import "alpine";

import { loadImage } from "./utils.js";

const originalImageName = location.pathname.split("/")[1];

Alpine.store("image", {
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

  generateLink({ image, width, height }) {
    if (!width && !height) return Alpine.store("image").image.link;

    let link = `/api/operate?filename=${image}`;

    if (width) link += `&w=${width}`;
    if (height) link += `&h=${height}`;

    return link;
  },
});
