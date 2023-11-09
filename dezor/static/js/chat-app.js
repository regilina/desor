"use strict";
class ChatApp {
    questions = [
        'Как вас зовут?',
        'Сколько вам лет?',
        'Укажите ваш контакт?',
        'Какая у вас профессия?',
        'Сколько лет вы работаете?',
        'Каков ваш месячный доход?'
    ];
    currentQuestionIndex = 0;
    userAnswers = {
        name: '',
        age: '',
        contact: '',
        profession: '',
        experience: '',
        income: ''
    };
    chatMessages = null;
    userInput = null;
    sendButton = null;
    canvas = null;
    ctx = null;
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas?.getContext('2d');
        if (this.userInput) {
            this.userInput.focus();
        }
        this.startChat();
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                if (this.userInput) {
                    this.userInput.focus();
                }
                this.sendMessage();
            });
        }
        if (this.userInput) {
            this.userInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    this.sendMessage();
                    if (this.userInput) {
                        this.userInput.focus();
                    }
                }
            });
        }
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
        if (this.chatMessages) {
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
        if (this.currentQuestionIndex < this.questions.length) {
            this.typeQuestion(this.questions[this.currentQuestionIndex], 50);
        }
    }
    sendMessage() {
        if (this.userInput) {
            const userMessage = this.userInput.value;
            if (userMessage.trim() !== '') {
                this.handleUserMessage(userMessage);
                this.userInput.value = '';
            }
        }
    }
    handleUserMessage(message) {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.userAnswers[Object.keys(this.userAnswers)[this.currentQuestionIndex]] = message;
            this.currentQuestionIndex++;
            this.typeAnswer(message, 50);
            this.startChat();
        }
        else {
            this.userAnswers[Object.keys(this.userAnswers)[this.currentQuestionIndex]] = message;
            this.handleFinalAnswer(message);
        }
    }
    handleFinalAnswer(answer) {
        const monthlyIncome = parseFloat(answer);
        const hourlyRate = (monthlyIncome / (22 * 8)).toFixed(0);
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
        });
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
