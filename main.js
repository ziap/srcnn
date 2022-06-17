const input = document.querySelector('#file-input')
const output = document.querySelector('#output')
const input_menu = document.querySelector('#input-menu')

const worker = new Worker(new URL('./worker.js', import.meta.url))

function bicubic_upsampling(image, scale=2) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = image.width * scale
    canvas.height = image.height * scale
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

function render(image_data) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = image_data.width
    canvas.height = image_data.height
    ctx.putImageData(image_data, 0, 0)
    
    return canvas.toBlob(blob => {
        const anchor = document.createElement('a')
        anchor.href = URL.createObjectURL(blob)
        anchor.click()
        URL.revokeObjectURL(blob)
    },'image/jpeg', 1.0)
}

worker.addEventListener('message', e => {
    const { inp_data, out_data } = e.data

    render(out_data)
})

input.addEventListener('change', e => {
    if (!e.target.files || !e.target.files[0]) return
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        const img = new Image()
        img.addEventListener('load', () => worker.postMessage(bicubic_upsampling(img)))
        img.src = reader.result
    })
    reader.readAsDataURL(e.target.files[0])
    input_menu.remove()
})
