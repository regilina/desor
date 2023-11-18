class ChatApp {
    private questions: string[] = [
    'Привет, как тебя зовут? Укажи фамилию и имя',
    'Сколько тебе лет? Не стесняйся, возраст - признак истинной мудрости',
    'Кем работаешь? На что тратишь драгоценные минуты жизни?',
    'Каков твой стаж работы? Как долго шокируешь окружающих своим успехом?',
    'В каком городе работаешь? Где найти таких гениев?',
    'Твой месячный доход? Удиви меня!',
    'Оставь свой номер телефона, такого интересного собеседника я давно не встречал!'
  ]

  private currentQuestionIndex: number = 0
  private userAnswers: Record<string, string> = {
    fio: '',
    age: '0',
    profession: '',
    experience: '0',
    city: '',
    monthly_income: '0',
    contact: '',
    device: '',
    referrer: '',
    hourly_income: '',
    visit_duration: '0'
  }

  private sectionChat: HTMLElement | null = null
  private sectionResult: HTMLElement | null = null
  private chat: HTMLElement | null = null
  private chatMessages: HTMLElement | null = null
  private userInput: HTMLInputElement | null = null
  private sendButton: HTMLButtonElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private popup: HTMLElement | null = null
  private popupBtn: HTMLButtonElement | null = null
  private startTime: number = 0

  constructor () {
    this.sectionChat = document.getElementById('section-chat')
    this.sectionResult = document.getElementById('section-result')
    this.chat = document.getElementById('chat')
    this.chatMessages = document.getElementById('chat-messages')
    this.userInput = document.getElementById('user-input') as HTMLInputElement
    this.sendButton = document.getElementById('send-button') as HTMLButtonElement
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.ctx = this.canvas?.getContext('2d')
    this.popup = document.getElementById('popup')
    this.popupBtn = document.getElementById('chat-popup-btn') as HTMLButtonElement

    this.startTime = Date.now()

    const referrer = document.referrer

    // Получение информации о типе устройства (desktop или mobile)
    let device = 'D' // По умолчанию предполагаем, что это рабочий стол

    // Проверяем ширину экрана для определения типа устройства
    if (window.innerWidth < 768) {
        device = 'M' // Если ширина экрана меньше 768px, считаем это мобильным устройством
    }

    this.userAnswers.device = device
    this.userAnswers.referrer = referrer

    this.startChat()

    if (this.sendButton) {
      this.sendButton.addEventListener('click', () => {
        this.sendMessage()
      })
    }

    if (this.userInput) {
      this.userInput.focus()
      this.userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.sendMessage()

        }
      })
    }

    window.addEventListener('beforeunload', () => {
      this.handlePageClose()
    })

    window.scrollTo(0, 0)
  }

  private typeMessage (message: string, isUser: boolean, speed: number) {
    if (this.chatMessages && this.userInput) {
      const messageElement = document.createElement('div')
      messageElement.classList.add('message', isUser ? 'user' : 'bot')
      messageElement.textContent = message
      this.chatMessages.appendChild(messageElement)

      // Прокручиваем чат вниз, чтобы были видны последние сообщения
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight
    }
  }

  private typeQuestion (question: string, speed: number) {
    this.typeMessage(question, false, speed)
  }

  private typeAnswer (answer: string, speed: number) {
    this.typeMessage(answer, true, speed)
  }

  private startChat () {
    if (this.currentQuestionIndex < this.questions.length) {
      this.typeQuestion(this.questions[this.currentQuestionIndex], 50)
    }
  }

  private sendDataToServer (data: Record<string, any>) {

    const timeOnSiteInSeconds = Math.floor((Date.now() - this.startTime) / 1000)
    this.userAnswers.visit_duration = timeOnSiteInSeconds.toString() // Добавляем время пребывания в данные пользователя

    const currentDomain: string = window.location.origin
    const url: string = `${currentDomain}/submit_data/`

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': 'csrftoken'
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((responseData) => {
        // Обработка ответа от сервера, если необходимо
        console.log('Ответ сервера:', responseData)
      })
      .catch((error) => {
        // Обработка ошибки при отправке данных
        console.error('Произошла ошибка:', error)
      })
  }

  private sendMessage () {
    if (this.userInput) {
      const userMessage = this.userInput.value.trim()
      if (userMessage !== '') {
        this.handleUserMessage(userMessage)
        this.userInput.value = ''

      }
    }
  }

  private validateInput (key: string, value: string): boolean {
    switch (key) {
      case 'fio':
        return !/\d/.test(value)
      case 'age':
        const parsedAge = parseFloat(value)
        return !isNaN(parsedAge) && Number.isInteger(parsedAge) && parsedAge > 0 && parsedAge < 150 && /^\d+$/.test(value)
      case 'contact':
        return /^\+7\d{10}$/.test(value) || /^@[A-Za-z0-9_]+$/.test(value)
      case 'monthly_income':
        const parsedIncome = parseFloat(value)
        return !isNaN(parsedIncome) && Number.isInteger(parsedIncome) && parsedIncome >= 0 && /^\d+$/.test(value)
      default:
        return true
    }
  }

  private handleUserMessage (message: string) {
    const currentQuestionKey = Object.keys(this.userAnswers)[this.currentQuestionIndex]

    if (this.validateInput(currentQuestionKey, message)) {
      this.userAnswers[currentQuestionKey] = message

      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
        this.typeAnswer(message, 50)
        this.startChat()
        if (this.userInput) {
          this.userInput.focus()
        }
      } else {
        this.userAnswers[currentQuestionKey] = message
        this.handleFinalAnswer(message)
      }
    } else {
      this.typeQuestion('Пожалуйста, введите корректные данные', 50)
    }
  }

  private handlePageClose () {
    this.sendDataToServer(this.userAnswers) // Отправка данных перед закрытием страницы
  }

  private handleFinalAnswer (answer: string) {
    this.typeAnswer(answer, 50)

    console.log('Введенный месячный доход:', this.userAnswers.monthly_income) // Добавим эту строку для вывода введенного значения месячного дохода

  const monthlyIncome = parseFloat(this.userAnswers.monthly_income)
  console.log('Преобразованный месячный доход:', monthlyIncome) // Вывод преобразованного значения в консоль

  const hourlyRate = (parseInt(this.userAnswers.monthly_income) / (22 * 8)).toFixed(0)
  console.log('Часовая ставка до округления:', hourlyRate) // Вывод часовой ставки до округления

    this.userAnswers.hourly_income = hourlyRate.toString()

    // this.sendDataToServer(this.userAnswers)

    if (this.popup) {
      this.showPopup()
    }
  }

  private drawHourlyRate (hourlyRate: string) {
    if (this.ctx && this.canvas) {
      this.canvas.classList.remove('chat__canvas_hidden')
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      const backgroundImage = new Image()
      backgroundImage.src = '../static/img/cat.jpg'

      backgroundImage.onload = () => {
        if (this.ctx && this.canvas) {
          this.ctx.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height)
          this.ctx.font = '36px Arial'
          this.ctx.fillStyle = 'blue'
          this.ctx.fillText(hourlyRate.toString(), 80, 60)
        }
      }
    }
  }

  private showPopup () {
    if (this.popup) {
      this.popup.classList.add('show')
    }

    this.popupBtn?.addEventListener('click', () => {
      this.closePopup()
    })

  }

  private closePopup () {
    if (this.popup) {
      this.popup.classList.remove('show')
    }

  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ChatApp()
})
