const bar = document.querySelector('#bar')

export function make_progress_bar(delay) {
    let progress = 0
    setInterval(() => {
        progress += (1 - progress) / 10000 * delay
        bar.style.width = progress * 100 + '%'
    }, delay)
}