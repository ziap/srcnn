import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-wasm'

import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm'
import wasm from '@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm?url'
import simd from '@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-simd.wasm?url'
import threaded_simd from '@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-threaded-simd.wasm?url'

setWasmPaths({
    'tfjs-backend-wasm.wasm': wasm,
    'tfjs-backend-wasm-simd.wasm': simd,
    'tfjs-backend-wasm-threaded-simd.wasm': threaded_simd
})

tf.setBackend('wasm').then(async () => {
    const Ky = tf.tensor([0.299, 0.587, 0.114])
    const Kcb = tf.tensor([-0.16873589, -0.33126411, 0.5])
    const Kcr = tf.tensor([0.5, -0.41868759, -0.08131241])

    const Kr = tf.tensor([1, -9.97600494e-19, 1.402])
    const Kg = tf.tensor([1, -3.44136286e-1, -7.14136286e-1])
    const Kb = tf.tensor([1, 1.772, 5.34905453e-17])
    
    const model = await tf.loadLayersModel('../model.json')

    function from_rgb(image) {
        const [h, w, c] = image.shape
        image = image.reshape([h * w, c])
        const y = tf.dot(image, Ky).reshape([h, w])
        const cb = tf.dot(image, Kcb).add(0.5).reshape([h, w])
        const cr = tf.dot(image, Kcr).add(0.5).reshape([h, w])
        image.dispose()
        return [y, cb, cr]
    }

    function to_rgb(y, cb, cr) {
        return tf.tidy(() => {
            let ycbcr = tf.stack([y, cb.add(-0.5), cr.add(-0.5)], -1)
            const [h, w, c] = ycbcr.shape
            ycbcr = ycbcr.reshape([h * w, c])
            const r = ycbcr.dot(Kr)
            const g = ycbcr.dot(Kg)
            const b = ycbcr.dot(Kb)
            return tf.stack([r, g, b], -1).reshape([h, w, c])
        })
    }

    async function upscale_image(image) {
        const output = tf.tidy(() => {
            const im_tensor = tf.browser.fromPixels(image).cast('float32').div(255.0)
            const [y, cb, cr] = from_rgb(im_tensor)
            const zeros = tf.zeros(im_tensor.shape)
            const ones = tf.ones(im_tensor.shape)
            const pred = model
                .predict(
                    y
                        .pad([
                            [6, 6],
                            [6, 6]
                        ])
                        .expandDims(0)
                        .expandDims(-1)
                )
                .squeeze()
            return to_rgb(pred, cb, cr).maximum(zeros).minimum(ones)
        })
        const data = await tf.browser.toPixels(output)
        const imgdata = new ImageData(data, image.width, image.height)
        output.dispose()
        return imgdata
    }

    addEventListener('message', e => {
        upscale_image(e.data).then(out_data => postMessage({
            inp_data: e.data,
            out_data
        }))
    })
})
