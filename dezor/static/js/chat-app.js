"use strict";
class ChatApp {
    questions = [
        'Как вас зовут?',
        'Сколько вам лет?',
        'Укажите ваш контакт (телефон, телеграм)?',
        'В каком городе работаете?',
        'Какая у вас профессия?',
        'Сколько лет вы работаете? (Стаж)',
        'Каков ваш месячный доход?'
    ];
    currentQuestionIndex = 0;
    userAnswers = {
        fio: '',
        age: '',
        contact: '',
        city: '',
        profession: '',
        experience: '',
        monthly_income: '',
        hourly_income: '',
        id: ''
    };
    sectionChat = null;
    sectionResult = null;
    chat = null;
    chatMessages = null;
    userInput = null;
    sendButton = null;
    canvas = null;
    ctx = null;
    constructor() {
        this.sectionChat = document.getElementById('section-chat');
        this.sectionResult = document.getElementById('section-result');
        this.chat = document.getElementById('chat');
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas?.getContext('2d');
        this.startChat();
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        if (this.userInput) {
            this.userInput.focus();
            this.userInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        window.scrollTo(0, 0);
    }
    typeText(message, element, speed) {
        let i = 0;
        const interval = setInterval(() => {
            if (i < message.length) {
                element.textContent += message[i];
                i++;
            }
            else {
                clearInterval(interval);
            }
        }, speed);
    }
    typeMessage(message, isUser, speed) {
        if (this.chatMessages && this.userInput) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', isUser ? 'user' : 'bot');
            this.chatMessages.appendChild(messageElement);
            this.typeText(message, messageElement, speed);
        }
    }
    typeQuestion(question, speed) {
        this.typeMessage(question, false, speed);
    }
    typeAnswer(answer, speed) {
        this.typeMessage(answer, true, speed);
    }
    startChat() {
        const userId = localStorage.getItem('userId');
        if (userId) {
            this.userAnswers.id = userId;
        }
        if (this.currentQuestionIndex < this.questions.length) {
            this.typeQuestion(this.questions[this.currentQuestionIndex], 50);
        }
    }
    sendDataToServer(data) {
        fetch('/your-server-endpoint', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then((responseData) => {
            // Обработка ответа от сервера, если необходимо
            console.log('Ответ сервера:', responseData);
        })
            .catch((error) => {
            // Обработка ошибки при отправке данных
            console.error('Произошла ошибка:', error);
        });
    }
    sendMessage() {
        if (this.userInput) {
            const userMessage = this.userInput.value.trim();
            if (userMessage !== '') {
                this.handleUserMessage(userMessage);
                this.userInput.value = '';
                this.userInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    handleUserMessage(message) {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.userAnswers[Object.keys(this.userAnswers)[this.currentQuestionIndex]] = message;
            this.currentQuestionIndex++;
            this.typeAnswer(message, 50);
            this.sendDataToServer(this.userAnswers);
            this.startChat();
            if (this.userInput) {
                this.userInput.focus();
            }
        }
        else {
            this.userAnswers[Object.keys(this.userAnswers)[this.currentQuestionIndex]] = message;
            this.handleFinalAnswer(message);
        }
    }
    handleFinalAnswer(answer) {
        this.typeAnswer(answer, 50);
        const monthlyIncome = parseFloat(answer);
        const hourlyRate = (monthlyIncome / (22 * 8)).toFixed(0);
        this.userAnswers.hourly_income = hourlyRate;
        this.sendDataToServer(this.userAnswers);
        if (this.sectionChat && this.sectionResult) {
            this.sectionChat.style.display = 'none';
            this.sectionResult.style.display = 'block';
            this.sectionResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (this.ctx && this.canvas) {
            this.canvas.classList.remove('chat__canvas_hidden');
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.typeQuestion(`Ваша часовая ставка: ${hourlyRate} рублей в час`, 50);
            setTimeout(() => {
                this.drawHourlyRate(hourlyRate);
            }, 2000);
        }
    }
    drawHourlyRate(hourlyRate) {
        if (this.ctx && this.canvas) {
            this.canvas.classList.remove('chat__canvas_hidden');
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const backgroundImage = new Image();
            backgroundImage.src = '../static/img/cat.jpg';
            backgroundImage.onload = () => {
                if (this.ctx && this.canvas) {
                    this.ctx.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.font = '36px Arial';
                    this.ctx.fillStyle = 'blue';
                    this.ctx.fillText(hourlyRate.toString(), 80, 60);
                }
            };
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
