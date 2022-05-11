import "https://unpkg.com/alpinejs";

Alpine.data("addImage", () => ({
  open: false,
  file: null,
  preview: null,

  toggle() {
    this.open = !this.open;
  },

  onSubmit() {
    console.log(this.file);
    this.toggle();
  },
  onFileChange(e) {
    const file = e.target.files[0];
    if (file) this.preview = URL.createObjectURL(file);
  },
}));
