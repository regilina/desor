class ChatApp {
    private questions: string[] = [
    'Как вас зовут?',
    'Сколько вам лет?',
    'Укажите ваш контакт (телефон, телеграм)?',
    'В каком городе работаете?',
    'Какая у вас профессия?',
    'Сколько лет вы работаете? (Стаж)',
    'Каков ваш месячный доход?'
  ]

  private currentQuestionIndex: number = 0
  private userAnswers: Record<string, string> = {
    fio: '',
    age: '',
    contact: '',
    city: '',
    profession: '',
    experience: '',
    monthly_income: '',
    hourly_income: ''
  }

  private sectionChat: HTMLElement | null = null
  private sectionResult: HTMLElement | null = null
  private chat: HTMLElement | null = null
  private chatMessages: HTMLElement | null = null
  private userInput: HTMLInputElement | null = null
  private sendButton: HTMLButtonElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor () {
    this.sectionChat = document.getElementById('section-chat')
    this.sectionResult = document.getElementById('section-result')
    this.chat = document.getElementById('chat')
    this.chatMessages = document.getElementById('chat-messages')
    this.userInput = document.getElementById('user-input') as HTMLInputElement
    this.sendButton = document.getElementById('send-button') as HTMLButtonElement
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.ctx = this.canvas?.getContext('2d')

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

    window.scrollTo(0, 0)
  }

  private typeText (message: string, element: HTMLElement, speed: number) {
    let i = 0
    const interval = setInterval(() => {
      if (i < message.length) {
        element.textContent += message[i]
        i++
      } else {
        clearInterval(interval)
      }
    }, speed)
  }

  private typeMessage (message: string, isUser: boolean, speed: number) {
    if (this.chatMessages && this.userInput) {
      const messageElement = document.createElement('div')
      messageElement.classList.add('message', isUser ? 'user' : 'bot')
      this.chatMessages.appendChild(messageElement)
      this.typeText(message, messageElement, speed)
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
    const userId = localStorage.getItem('userId')

    const requestData = {
      id: userId,
      data: data
    }

    const currentDomain: string = window.location.origin
    const url: string = `${currentDomain}/submit_data/`

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json'
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
        this.userInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  private validateInput (key: string, value: string): boolean {
    switch (key) {
      case 'age':
        return !isNaN(parseInt(value)) && parseInt(value) > 0 && parseInt(value) < 150
      case 'contact':
        return /^\+7\d{10}$/.test(value) || /^@[A-Za-z0-9_]+$/.test(value)
      case 'experience':
        return !isNaN(parseInt(value)) && parseInt(value) >= 0
      case 'monthly_income':
        return !isNaN(parseFloat(value)) && parseFloat(value) >= 0
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
        this.sendDataToServer(this.userAnswers)
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
    const monthlyIncome = parseFloat(answer)
    const hourlyRate = (monthlyIncome / (22 * 8)).toFixed(0)
    this.userAnswers.hourly_income = hourlyRate

    this.sendDataToServer(this.userAnswers)

    if (this.sectionChat && this.sectionResult) {
      this.sectionChat.style.display = 'none'
      this.sectionResult.style.display = 'block'

      this.sectionResult.scrollIntoView({ behavior: 'smooth', block: 'start' })

    }

    if (this.ctx && this.canvas) {
      this.canvas.classList.remove('chat__canvas_hidden')
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.typeQuestion(`Ваша часовая ставка: ${hourlyRate} рублей в час`, 50)

      setTimeout(() => {
        this.drawHourlyRate(hourlyRate)
      }, 2000)
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
}

document.addEventListener('DOMContentLoaded', () => {
  new ChatApp()
})
