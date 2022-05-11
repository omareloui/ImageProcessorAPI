import "https://unpkg.com/alpinejs";

Alpine.store("images", {
  images: [],

  async getImages() {
    this.images = await (await fetch("/api/images")).json();
  },

  addImage(newImage) {
    this.images.unshift(newImage);
  },
});

Alpine.data("addImage", () => ({
  open: false,
  file: null,
  preview: null,

  error: null,

  toggle() {
    this.open = !this.open;
  },

  onFileChange(e) {
    this.error = null;
    this.preview = null;
    const file = e.target.files[0];
    if (file) this.preview = URL.createObjectURL(file);
  },

  async onSubmit(e) {
    try {
      if (!this.file) throw new Error("You have to choose an image.");

      const data = new FormData(e.target);
      const res = await fetch("/api/images", {
        method: "POST",
        body: data,
      });
      const newImage = await res.json();

      Alpine.store("images").addImage(newImage);
      this.cancel();
    } catch (e) {
      this.error = e.message;
    }
  },

  cancel() {
    this.file = null;
    this.preview = null;
    this.open = false;
    this.error = null;
  },
}));
