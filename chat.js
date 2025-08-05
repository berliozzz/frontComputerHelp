/***************** Global variables**********************/
let callbackModalIsOpen = false
const body = document.querySelector('body')

/*******************************************************/
/**************** Go to price table  *******************/
/*******************************************************/
const priceTable = document.querySelector('.price__table')
const priceBtn = document.querySelector('.price-btn')

if (priceTable && priceBtn) {
  priceBtn.addEventListener('click', () => {
    window.scrollTo({
      top: getCoords(priceTable).top - 60,
      behavior: 'smooth'
    })
  })
}

/*******************************************************/
/******************** Go to top  ***********************/
/*******************************************************/
const goTopBtn = document.querySelector('.go-top')

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY
  const coords = document.documentElement.clientHeight
  if (scrolled > coords) {
    goTopBtn.classList.add('go-top--show')
  } else {
    goTopBtn.classList.remove('go-top--show')
  }
})

if (body && goTopBtn) {
  goTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: getCoords(body).top,
      behavior: 'smooth'
    })
  })
}

/*************************************************************/
/****************** Help functions ***************************/
/*************************************************************/
function getCoords(elem) {
  let box = elem.getBoundingClientRect()

  return {
    top: box.top + window.scrollY,
    right: box.right + window.scrollX,
    bottom: box.bottom + window.scrollY,
    left: box.left + window.scrollX
  }
}

/*******************************************************/
/********************* isMobile ************************/
/*******************************************************/
const isMobile = {
  Android: () => navigator.userAgent.match(/Android/i),
  BlackBerry: () => navigator.userAgent.match(/BlackBerry/i),
  iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
  Opera: () => navigator.userAgent.match(/Opera Mini/i),
  Windows: () => navigator.userAgent.match(/IEMobile/i),
  any: () => (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()) 
}
if (isMobile.any()) {
  document.body.classList.add('_touch')

  const menuArrows = document.querySelectorAll('.menu__arrow')
  if (menuArrows.length > 0) {
    for (const menuArrow of menuArrows) {
      menuArrow.addEventListener('click', () => {
        menuArrow.parentElement.classList.toggle('_active')
      })
    }
  }
  const menuRightArrows = document.querySelectorAll('.menu__right-arrow')
  if (menuRightArrows.length > 0) {
    for (const menuRightArrow of menuRightArrows) {
      menuRightArrow.addEventListener('click', () => {
        menuRightArrow.parentElement.classList.toggle('_active')
      })
    }
  }
} else {
  document.body.classList.add('_pc')
}

/*******************************************************/
/****************** Menu burger ************************/
/*******************************************************/
const iconMenu = document.querySelector('.menu__icon')
if (iconMenu) {
  const menuBody = document.querySelector('.menu__body')
  iconMenu.addEventListener('click', () => {
    document.body.classList.toggle('_lock')
    iconMenu.classList.toggle('_active')
    menuBody.classList.toggle('_active')
  })
}

/********************************************************/
/****************** Footer spoller **********************/
/********************************************************/
const spollerBtns = document.querySelectorAll('.footer__block-title')
if (spollerBtns.length > 0) {
  for (const spollerBtn of spollerBtns) {
    spollerBtn.addEventListener('click', () => {
      spollerBtn.classList.toggle('_active')
      const btnUl = spollerBtn.nextSibling.nextSibling
      btnUl.classList.toggle('_hidden')
    })
  }
}

/*******************************************************/
/****************** Telegram chat **********************/
/*******************************************************/
const getRandomInt = max => Math.floor(Math.random() * max)

const token = '7160391413:AAEQbwVNJc-WJaveYO8CTga3AlqO2en_stU'
let chatId = '72826868'
let botId = '7160391413'
const manager = 'Николай 👨‍💻'
let startChat = false
let count = 0
let lastMessId, firstMessId, newMessId, checkReply, responseTimer
const idStart = getRandomInt(999)

const chatBody = document.querySelector('.chat__body')
const chatBodyItem = document.querySelectorAll('.chat__body__item')
const chatMainInput = document.querySelector('.chat__main__input')
const chatInputSubmit = document.querySelector('.chat__input__submit')
const chatClose = document.querySelector('.chat__close')
const chatWrap = document.querySelector('.chat__wrap')
const chatIcon = document.querySelector('.chat-icon')
let isChatOpen = false
let isNotifShow = false

window.soundPush = (url) => {
  let audio = new Audio()
  audio.src = url
  audio.autoplay = true
  audio.volume = 0.6
  document.body.appendChild(audio)

  audio.addEventListener('ended',e => {
    audio.remove()
  })
  return url
}

class TelegramChat {
  open() {
    let store = localStorage.getItem('historyMessages')
    if (store !== null) chatBody.innerHTML = store

    // навешиваем обработчики только когда запускаем чат в первый раз
    if (!startChat) {
      chatMainInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') this.submit()
        if (event.target.value !== '') chatMainInput.classList.remove('validate__error')
      })
      chatInputSubmit.addEventListener('click', () => this.submit())
      chatClose.addEventListener('click', () => this.close())
      startChat = true
    }    

    chatBody.scrollTop = 100000
    chatWrap.classList.add('open')

    setTimeout(() => {
      chatMainInput.focus()
    }, 1000);

    fetch(`https://api.telegram.org/bot${token}/getupdates`)
      .then(response => response.json())
      .then(res => {
        if (!res.ok) {
          console.log('response: ' + res.ok)
        }
        lastMessId = res.result[res.result.length - 1].message.message_id
        console.log('lastMessId: ' + lastMessId)
        firstMessId = lastMessId
      })
      .catch(err => {
        console.log('get lastMessId error: ' + err)
      })
    
    isChatOpen = true
    localStorage.setItem('wasChatOpen', 'yes')
    this.deleteItem()
    goTopBtn.style.bottom = '420px'
    if (window.innerWidth < 768) scrollLock.disablePageScroll(chatBody)
  }
  close() {
    clearInterval(responseTimer)
    chatWrap.classList.remove('open')
    isChatOpen = false
    goTopBtn.style.bottom = '75px'
    if (isNotifShow) {
      chatIcon.classList.remove('show-notification')
    }
    if (window.innerWidth < 768) scrollLock.enablePageScroll(chatBody)
  }
  deleteItem(){
    chatBodyItem.forEach(el => {
      const chatBodyItemDelete = el.querySelector('.chat__body__item__delete')
      if(chatBodyItemDelete) {
        chatBodyItemDelete.addEventListener('click', () => {
          el.remove()
          localStorage.setItem('historyMessages', chatBody.innerHTML)
        })
      }
    })
  }
  submit() {
    let val = chatMainInput.value
    if (val !== '') {
      chatMainInput.classList.remove('validate__error')
      let tplItemClient = 
       `<div class="chat__body__item chat__body__item__client">
          <div class="chat__body__item__user__container">
            <img class="chat__body__item__user__icon cards__theme" src="assets/img/chat/user.png" alt="аватарка user">
            <span class="chat__body__item__user">Вы</span>
          </div>
          <span class="chat__body__item__text">${val}</span>
          <i class="chat__body__item__time">${new Date().toLocaleTimeString()}</i>
        </div>`

      chatBody.innerHTML += tplItemClient
      chatBody.scrollTop = 100000

      fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=User${idStart}: ${val}`)
      soundPush('assets/sound/send-message.mp3')
      localStorage.setItem('historyMessages', chatBody.innerHTML)
      setTimeout(() => chatMainInput.value = ''.trim(), 0)
    } else {
      alert('Введите текст')
    }
    this.deleteItem()
    responseTimer = setInterval(() => this.checkResponse(), 3000)
    chatMainInput.value = ''
  }
  checkResponse() {
    count++
    if(count > 120 && lastMessId === firstMessId) clearInterval(responseTimer)
    fetch(`https://api.telegram.org/bot${token}/getupdates`)
      .then(response => response.json())
      .then(res => {
        let resLastMess = res.result[res.result.length - 1].message
        if(resLastMess.reply_to_message !== undefined) {
          checkReply = resLastMess.reply_to_message.text.includes(idStart)
        } else {
          checkReply = false
        }

        newMessId = resLastMess.message_id

        if (newMessId > lastMessId && checkReply) {
          let Text = res.result[res.result.length - 1].message.text
          let tplItemManager = 
           `<div class="chat__body__item chat__body__item__manager">
              <div class="chat__body__item__user__container">
                <img class="chat__body__item__user__icon cards__theme" src="assets/img/chat/manager.png" alt="аватарка менеджера">
                <span class="chat__body__item__user">${manager}</span>
              </div>
              <span class="chat__body__item__text">${Text}</span>
              <i class="chat__body__item__time">${new Date().toLocaleTimeString()}</i>
            </div>`

          chatBody.innerHTML += tplItemManager
          this.deleteItem()
          soundPush('assets/sound/get-message.mp3')
          localStorage.setItem("historyMessages", chatBody.innerHTML)
          chatBody.scrollTop = 100000;
          lastMessId = newMessId
        }
      })
      .catch(err => {
        console.log(err.message)
      })
  }
}
const telegramChat = new TelegramChat()
const openChatBtn = document.querySelector('.chat-icon')
const smallChatIcon = document.querySelector('.icon-chat')
if (smallChatIcon) {
  smallChatIcon.addEventListener('click', event => {
    telegramChat.open()
  })
}
if (openChatBtn) {
  openChatBtn.addEventListener('click', event => {
    telegramChat.open()
  })
}
// show chat after delay
setTimeout(() => {
  if (localStorage.getItem('wasChatOpen') === 'yes') return
  if (!isChatOpen && !isMobile.any() && !callbackModalIsOpen) {
    telegramChat.open()
  }
  if (isMobile.any() && !isChatOpen) {
    chatIcon.classList.add('show-notification')
    isNotifShow = true
  }
  soundPush('assets/sound/open-chat.mp3')
}, 10000)

/***********************************************************/
/****************** Our command slider *********************/
/***********************************************************/
const sliderLine = document.querySelector('.our__comand__slider-line')
const nextButtons = document.querySelectorAll('.our__comand__next')
const prevButtons = document.querySelectorAll('.our__comand__prev')
let offset = 0
if (nextButtons && sliderLine) {
  for (const nextButton of nextButtons) {
    nextButton.addEventListener('click', () => {
      offset = offset - 100
      if (offset === -400) {
        offset = 0
      }
      sliderLine.style.left = offset + '%'
    })
  }
}
if (prevButtons && sliderLine) {
  for (const prevButton of prevButtons) {
    prevButton.addEventListener('click', () => {
      offset = offset + 100
      console.log(offset);
      if (offset > 0) {
        offset = -300
      }
      sliderLine.style.left = offset + '%'
    })
  }
}

/********************************************************/
/****************** Callback modal **********************/
/********************************************************/
const callbackModal = document.getElementById('popup')
if (callbackModal) {
  const callbackBtns = document.querySelectorAll('.callback-btn')
  if (callbackBtns.length > 0) {
    for (const btn of callbackBtns) {
      btn.addEventListener('click', () => {
        callbackModal.classList.add('open')
        document.body.classList.toggle('_lock')
        callbackModalIsOpen = true
        // закрытие попапа по клику вне его контента
        callbackModal.addEventListener('click', (event) => {
          if (!event.target.closest('.popup__content')) {
            closePopup()
            event.preventDefault()
          }
        })
      })
    }
  }
  const popupCloseBtns = document.querySelectorAll('.close__popup')
  if (popupCloseBtns.length > 0) {
    for (const btn of popupCloseBtns) {
      btn.addEventListener('click', el => {
        closePopup()
        el.preventDefault()
      })
    }
  }
}
const closePopup = () => {
  if (callbackModal.classList.contains('open')) {
    callbackModal.classList.remove('open')
    document.body.classList.toggle('_lock')
    callbackModalIsOpen = false
  }
}

/****************************************************************/
/****************** DOMContentLoaded event **********************/
/****************************************************************/
document.addEventListener('DOMContentLoaded', () => {
  /****************** FetchIt **********************/
  const notyf = new Notyf()
  FetchIt.Message = {
    success(message) {
      notyf.success(message);
    },
    error(message) {
      notyf.error(message);
    }
  }

  /****************** Validation phone number **********************/
  let phoneInputs = document.querySelectorAll('input[data-tel-input]')
  if (phoneInputs.length > 0) {
    for (const input of phoneInputs) {
      input.addEventListener('input', event => {
        let input = event.target
        let inputNumbersValue = input.value.replace(/\D/g, '')
        let formattedInputValue = ''
        let selectionStart = input.selectionStart
        if (!inputNumbersValue) return input.value = ''
        if (input.value.length != selectionStart) {
          if (event.data && /\D/g.test(event.data)) {
            input.value = inputNumbersValue
          }
        }
        if (['7', '8', '9'].includes(inputNumbersValue[0])) {
          if (inputNumbersValue[0] == '9') inputNumbersValue = '7' + inputNumbersValue
          const firstSymbols = '+7'
          formattedInputValue = firstSymbols + ' '
          if (inputNumbersValue.length > 1) {
            formattedInputValue += '(' + inputNumbersValue.substring(1, 4)
          }
          if (inputNumbersValue.length >= 5) {
            formattedInputValue += ') ' + inputNumbersValue.substring(4, 7)
          }
          if (inputNumbersValue.length >= 8) {
            formattedInputValue += '-' + inputNumbersValue.substring(7, 9)
          }
          if (inputNumbersValue.length >= 10) {
            formattedInputValue += '-' + inputNumbersValue.substring(9, 11)
          }
        }
        input.value = formattedInputValue
      })
      input.addEventListener('keydown', event => {
        let input = event.target
        let inputNumbersValue = input.value.replace(/\D/g, '')
        if (event.keyCode == 8 && inputNumbersValue.length == 1) {
          input.value = ''
        }
      })
      input.addEventListener('paste', event => {
        let pasted = event.clipboardData || window.clipboardData
        let input = event.target
        let inputNumbersValue = input.value.replace(/\D/g, '')
        if (pasted) {
          let pastedText = pasted.getData('Text')
          if (/\D/g.test(pastedText)) input.value = inputNumbersValue
        }
      })
    }
  }
})
/*********************************************************************/
/****************** Close popup after send form **********************/
/*********************************************************************/
document.addEventListener('fetchit:reset', (event) => {
  closePopup()
})