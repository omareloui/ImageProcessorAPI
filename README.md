# Image Processing API (with UI)

It's an API to generate placeholder images and manipulate images with a front-end to help you work it out. You can upload whatever image you need then it allows you to resize, rotate, flip, add filters, change file type and more.

**Screen shots:**

![alt text](/docs/images/preview-1.png)
![alt text](/docs/images/preview-3.png)

## Set up and available scripts

After cloning the code you need to install the dependencies. You can use `npm` but it's advisable to use `pnpm` instead.

```bash
pnpm i # or npm i
```

To run the tests you can run this script

```bash
pnpm test # or npm test
```

Then, to build and use the application you need to run.

```bash
pnpm build # or npm run build
pnpm start # or npm start
```

By default it uses port `3000` for development and production and port `4000` for testing.

If you want to change that you can create an `.env` file in the root folder and provide your desired ports.

**How the `.env` file should look:**

```env
PORT=
TEST_PORT=
```

As for linting and formatting there is scripts for those too.

```bash
# Formatting
pnpm format # or npm run format

# Linting
pnpm lint # or npm run lint
```

---

## How To Use

There are two main features for the application

### Manipulate Images

You can manipulate images that are in `/public/images` folder or you can introduce your own images after uploading them using the UI.

#### Manipulating images using the API

`/api/operate` is the endpoint provided to manipulate existing images.

There are 2 required parameters required for the image to operate on. a) The image filename _with extension_. b) at least one operation on the image.

**Available operations:**

| Action          | Props Names                                 | Acceptable Value                         |
| --------------- | ------------------------------------------- | ---------------------------------------- |
| Select image    | `filename`, `image`, or `file`              | string                                   |
| Resize height   | `h` or `height`                             | number                                   |
| Resize width    | `w` or `width`                              | number                                   |
| Flip            | `fx` or `flip`                              | "true", "yes", "on", or no value         |
| Flop            | `fy` or `flop`                              | "true", "yes", "on", or no value         |
| Negate colors   | `n` or `negate`                             | "true", "yes", "on", or no value         |
| Greyscale       | `g`, `grayscale`, or `greyscale`            | "true", "yes", "on", or no value         |
| Rotate          | `r` or `rotate`                             | number                                   |
| Blur            | `b` or `blur`                               | number, "true", "yes", "on", or no value |
| Median          | `m` or `median`                             | number, "true", "yes", "on", or no value |
| Change filetype | `ext`, `extension`, `format`, or `filetype` | "jpg", "png", "webp", or "gif"           |

##### Examples

```bash
# Change the width of "santamonica.jpg" to 300
http://localhost:3000/api/operate?image=santamonica.jpg&w=300

# Change the size of "santamonica.jpg" to 300x300
http://localhost:3000/api/operate?image=santamonica.jpg&w=300&h=300

# Make "santamonica.jpg" blurry, change it's file type to webp and rotate it 90 deg
http://localhost:3000/api/operate?image=santamonica.jpg&b&ext=webp&r=90
```

#### Manipulating images using the web UI

You can access and operate on any image after going to `/:imageFilename`. `:imageFilename` being the full filename of the image _with extension_. Or you can visit `/` and it will display all the images available and you can upload your own images there too and select the image you want to operate on there.

After getting to the image you want to operate on you will be displayed with dashboard to preform all the available actions on the image. Of course with the preview of the image and the generated link displayed under it for later use.

### Generate Images

**You can generate the place holder only via the API.**

The server exposes the `/api/placeholder` endpoint to generate image with provided dimensions with a random color (that's before it's cached, after that it will bring the same color for the same sized image).

You have to provide the width and the height of the image to be generated.

| Action     | Props Names     | Acceptable Value |
| ---------- | --------------- | ---------------- |
| Set height | `h` or `height` | number           |
| Set width  | `w` or `width`  | number           |

```bash
# Get an image that is 200x200 in size
http://localhost:3000/api/placeholder?w=200&h=200
```

> You can remove the cache by sending a `DELETE` request to `/api/operate/cache` endpoint or delete the `/public/images/cache` folder.
