import "https://unpkg.com/alpinejs";

Alpine.data("addImage", () => ({
  open: false,
  file: null,
  preview: null,

  toggle() {
    this.open = !this.open;
  },

  onFileChange(e) {
    const file = e.target.files[0];
    if (file) this.preview = URL.createObjectURL(file);
  },

  async onSubmit(e) {
    const data = new FormData(e.target);
    const res = await fetch("/api/images", {
      method: "POST",
      body: data,
    });
    const newImage = await res.json();

    // TODO: add this to the previewed images array
    console.log(newImage);
  },

  cancel() {
    this.file = null;
    this.preview = null;
    this.open = false;
  },
}));
