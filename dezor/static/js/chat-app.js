"use strict";
class ChatApp {
    questions = [
        'Привет, как тебя зовут? Укажи фамилию и имя',
        'Сколько тебе лет? Не стесняйся, возраст - признак истинной мудрости',
        'Кем работаешь? На что тратишь драгоценные минуты жизни?',
        'Каков твой стаж работы? Как долго шокируешь окружающих своим успехом?',
        'В каком городе работаешь? Где найти таких гениев?',
        'Твой месячный доход? Удиви меня!',
        'Оставь свой номер телефона, такого интересного собеседника я давно не встречал!'
    ];
    currentQuestionIndex = 0;
    userAnswers = {
        fio: '',
        age: '0',
        profession: '',
        experience: '0',
        city: '',
        monthly_income: '0',
        contact: '',
        hourly_income: '0'
    };
    sectionChat = null;
    sectionResult = null;
    chat = null;
    chatMessages = null;
    userInput = null;
    sendButton = null;
    canvas = null;
    ctx = null;
    popup = null;
    popupBtn = null;
    constructor() {
        this.sectionChat = document.getElementById('section-chat');
        this.sectionResult = document.getElementById('section-result');
        this.chat = document.getElementById('chat');
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas?.getContext('2d');
        this.popup = document.getElementById('popup');
        this.popupBtn = document.getElementById('chat-popup-btn');
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
    typeMessage(message, isUser, speed) {
        if (this.chatMessages && this.userInput) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', isUser ? 'user' : 'bot');
            messageElement.textContent = message; // Установка всего текста сразу
            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
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
    sendDataToServer(data) {
        const userId = localStorage.getItem('userId');
        const requestData = {
            id: userId,
            data: data
        };
        const currentDomain = window.location.origin;
        const url = `${currentDomain}/submit_data/`;
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestData),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': 'csrftoken'
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
                this.scrollToBottom();
            }
        }
    }
    validateInput(key, value) {
        switch (key) {
            case 'age':
                const parsedAge = parseFloat(value);
                return !isNaN(parsedAge) && Number.isInteger(parsedAge) && parsedAge > 0 && parsedAge < 150 && /^\d+$/.test(value);
            case 'contact':
                return /^\+7\d{10}$/.test(value) || /^@[A-Za-z0-9_]+$/.test(value);
            case 'experience':
                const parsedExperience = parseFloat(value);
                return !isNaN(parsedExperience) && Number.isInteger(parsedExperience) && parsedExperience >= 0 && /^\d+$/.test(value);
            case 'monthly_income':
                const parsedIncome = parseFloat(value);
                return !isNaN(parsedIncome) && Number.isInteger(parsedIncome) && parsedIncome >= 0 && /^\d+$/.test(value);
            default:
                return true;
        }
    }
    handleUserMessage(message) {
        const currentQuestionKey = Object.keys(this.userAnswers)[this.currentQuestionIndex];
        if (this.validateInput(currentQuestionKey, message)) {
            this.userAnswers[currentQuestionKey] = message;
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.typeAnswer(message, 50);
                this.sendDataToServer(this.userAnswers);
                this.startChat();
                if (this.userInput) {
                    this.userInput.focus();
                }
            }
            else {
                this.userAnswers[currentQuestionKey] = message;
                this.handleFinalAnswer(message);
            }
        }
        else {
            this.typeQuestion('Пожалуйста, введите корректные данные', 50);
        }
    }
    handleFinalAnswer(answer) {
        this.typeAnswer(answer, 50);
        const monthlyIncome = parseFloat(answer);
        const hourlyRate = (monthlyIncome / (22 * 8)).toFixed(0);
        this.userAnswers.hourly_income = hourlyRate;
        this.sendDataToServer(this.userAnswers);
        if (this.popup) {
            this.showPopup();
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
    showPopup() {
        if (this.popup) {
            this.popup.classList.add('show');
        }
        this.popupBtn?.addEventListener('click', () => {
            this.closePopup();
        });
    }
    closePopup() {
        if (this.popup) {
            this.popup.classList.remove('show');
        }
    }
    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
