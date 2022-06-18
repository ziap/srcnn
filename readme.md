# SRCNN

Super-resolution Convolutional Neural Network for image upscaling.

Based on [Image Super-Resolution Using Deep Convolutional Networks](http://arxiv.org/abs/1501.00092).

The model is trained with 1500 images from [unsplash](https://unsplash.com/) using Python and Tensorflow.

The web app is built with:

- [Vite](https://vitejs.dev/)
- [Tensorflow.js](https://www.tensorflow.org/js)
- [WASM backend](https://www.npmjs.com/package/@tensorflow/tfjs-backend-wasm)
- WebWorker

## Online demo

To try the online demo, go to [this page](https://srcnn.vercel.app).

To host the Demo, clone the demo, build the app and serve the dist folder

```
npm i

npm run build
```

To use the development server, you need a browser with WebWorker module support

## Training

To train the model with your own data and settings use this [Notebook](https://colab.research.google.com/drive/1K8p0NCvdWgmAfvgh0wX7NnN0P2yk2M4f).

## Credit

- Bùi Huy Giáp
- Vũ Uy

## License

# License

This project is licensed under the [MIT license](LICENSE).