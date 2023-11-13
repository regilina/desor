class ChatApp {
  private questions: string[] = [
    'Как вас зовут?',
    'Какое ваше отчество?',
    'Какая ваша фамилия?',
    'Сколько вам лет?',
    'Укажите ваш контакт (телефон, телеграм)?',
    'Какая у вас профессия?',
    'Сколько лет вы работаете? (Стаж)',
    'Каков ваш месячный доход?'
  ]

  private currentQuestionIndex: number = 0
  private userAnswers: Record<string, string> = {
    name: '',
    patronymic: '',
    surname: '',
    age: '',
    contact: '',
    profession: '',
    experience: '',
    income: ''
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

  private sendMessage () {
    if (this.userInput) {
      const userMessage = this.userInput.value
      if (userMessage.trim() !== '') {
        this.handleUserMessage(userMessage)
        this.userInput.value = ''
      }
    }

    if (this.chat) {
      this.chat.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  private handleUserMessage (message: string) {
    const currentQuestionKey = Object.keys(this.userAnswers)[this.currentQuestionIndex]
    this.userAnswers[currentQuestionKey] = message
    this.sendAnswerToServer(currentQuestionKey, message)

    this.currentQuestionIndex++
    if (this.currentQuestionIndex < this.questions.length) {
      this.typeAnswer(message, 50)
      this.startChat()
      if (this.userInput) {
        this.userInput.focus()
      }
    } else {
      this.handleFinalAnswer(message)
    }
  }

  private sendAnswerToServer (key: string, answer: string) {
    const data = { [key]: answer }
    fetch('/your-server-endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((data) => {
      // Handle the server response if needed
    })
    .catch((error) => {
      // Handle error in sending data
    })
  }

  private handleFinalAnswer (answer: string) {
    this.typeAnswer(answer, 50)
    const monthlyIncome = parseFloat(answer)
    const hourlyRate = (monthlyIncome / (22 * 8)).toFixed(0)

    fetch('/your-server-endpoint', {
      method: 'POST',
      body: JSON.stringify(this.userAnswers),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((data) => {
        // Обработка ответа от сервера, если необходимо
      })
      .catch((error) => {
        // Обработка ошибки при отправке данных
      })

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
