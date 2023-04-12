const form = document.querySelector('.form')
const dwnlForm = document.querySelector('.dwnlForm')
const progress = document.querySelector('.progress')



function byteToStr(bytes) {
    if (bytes < 1024) {
        return bytes + " bytes"
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    }
 }

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetURL = e.target.url.value;
    progress.style.display = 'block'
    let response = await fetch('/streams', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(targetURL)
    }).then(response => response.json())
    .then(json => {
        if ('error' in json) {
            console.log('ERROR: ' + json['error']);
        } else {
            json['streams'] = json['streams'].filter(({progressive}) => progressive)
            createControls(json)
        }
    })
    e.target.url.value = ""
    })


function createControls(data) {
    progress.style.display = 'none'
    const title = document.createElement('p')
    const dwnlBtn = document.createElement('button')
    const select = document.createElement('select')
    const thumbnail = document.createElement('img')
    const wrapper = document.createElement('div')
    const btnImg = document.createElement('img')

    const streams = data['streams']
    
    for (let i = 0; i < streams.length; i++) {
        const option = document.createElement('option')
        const optionValue = [byteToStr(streams[i]['file_size']) , streams[i]['res']]
        option.value = streams[i]['itag']
        option.innerText = optionValue.join('/')

        select.append(option)
    }

    title.innerHTML = data['title']
    thumbnail.src = data['thumbnail']
    btnImg.src = '/images/icon-download.png'

    dwnlBtn.classList.add('downloadBtn')
    title.classList.add('title')
    select.classList.add('select')

    dwnlBtn.addEventListener('click', () => {
        const itag = select.value
        const link = document.createElement("a");
        link.href = `/download/${itag}`
        link.click()
        rerender()
    })

    dwnlBtn.append(btnImg)
    wrapper.append(select, dwnlBtn)
    dwnlForm.append( thumbnail, title, wrapper)
 
 }
 
 function rerender() {
    dwnlForm.innerText = ""
 }

