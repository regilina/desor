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
    hourly_income: '0',
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
  private hasUserResponse: boolean = false
  private userId: string | null = null

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
    console.log(window.innerWidth)
    console.log('device ' + device)
    this.userAnswers.device = device
    this.userAnswers.referrer = referrer

    if (this.userAnswers.device === 'M') {
      this.fetchUserId().then((id) => {
        this.userId = id

      }).catch((error) => {
        console.error('Ошибка при получении userId:', error)
      })
    }

    console.log('userId ' + this.userId)

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

    window.addEventListener('beforeunload', async (event) => {
      // event.preventDefault()  Предотвращаем закрытие страницы, пока данные не будут отправлены
      if (this.hasUserResponse) {
        await this.sendDataToServer(this.userAnswers) // Дождитесь завершения запроса на сервер
      }
    })

    window.scrollTo(0, 0)
  }

  private typeMessage(message: string, isUser: boolean, speed: number) {
    if (this.chatMessages && this.userInput) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', isUser ? 'user' : 'bot');
  
      if (!isUser) {
        const proFestText = document.createElement('span');
        proFestText.classList.add('bot-name');
        proFestText.textContent = 'Pro-fest';
        messageElement.appendChild(proFestText);
      }
  
      const messageText = document.createElement('span');
      messageText.classList.add('bot-text');
      messageText.textContent = message;
  
      messageElement.appendChild(messageText);
      this.chatMessages.appendChild(messageElement);
  
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
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

  private sendDataToServer (data: Record<string, any>, userId: string | null = null) {

    const timeOnSiteInSeconds = Math.floor((Date.now() - this.startTime) / 1000)
    this.userAnswers.visit_duration = timeOnSiteInSeconds.toString() // Добавляем время пребывания в данные пользователя

    const currentDomain: string = window.location.origin
    const url: string = `${currentDomain}/submit_data/`

    const jsonData = {
      id: userId,
      data: data
    }

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(jsonData),
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

  private async fetchUserId (): Promise<string | null> {
    try {
      const currentDomain: string = window.location.origin
      const url: string = `${currentDomain}/submit_data/`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': 'csrftoken'
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const responseData = await response.json()
      const userId: string = responseData.id
      console.log(userId + ' userId')
      return userId
    } catch (error) {
      console.error('Ошибка при получении userId:', error)
      return null // Вернуть null в случае ошибки
    }
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

      this.hasUserResponse = true
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
        this.typeAnswer(message, 50)
        if (this.userAnswers.device === 'M') {
          this.sendDataToServer(this.userAnswers, this.userId)
        }
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

  private handleFinalAnswer (answer: string) {
    this.typeAnswer(answer, 50)

    const monthlyIncome = parseFloat(this.userAnswers.monthly_income)

    const hourlyRate = (parseInt(this.userAnswers.monthly_income) / (22 * 8)).toFixed(0)
    this.userAnswers.hourly_income = hourlyRate.toString()

    this.sendDataToServer(this.userAnswers, this.userId)

    if (this.popup) {
      this.showPopup()
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
