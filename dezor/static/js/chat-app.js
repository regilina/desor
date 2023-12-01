"use strict";
class ChatApp {
    questions = [
        'Привет! Как вас зовут? Укажите фамилию и имя',
        'Сколько вам лет? Не стесняйтесь, возраст - признак истинной мудрости',
        'В какой сфере вы раскрываете свой талант на работе? Укажите свою профессию',
        'Сколько времени вы уже занимаетесь своим делом? Напишите число',
        'В каком уголке мира свершаются ваши профессиональные подвиги? Укажите город',
        'Ваш месячный доход? Напишите сумму',
        'Укажите свой никнейм в Telegram (или номер телефона, если Telegram не установлен)',
        'Записать вас на онлайн-фестиваль? На нём будет много интересного и полезного для карьеры'
    ];
    currentQuestionIndex = 0;
    userAnswers = {
        fio: '',
        age: '0',
        profession: '',
        experience: '0',
        city: '',
        monthly_income: '0',
        telegram: '',
        phone: '',
        referrer: '',
        visit_duration: '0',
        device: '',
        want_event: 'N',
        hourly_income: '0'
    };
    sectionChat = null;
    sectionResult = null;
    chat = null;
    chatMessages = null;
    userInput = null;
    popup = null;
    popupBtn = null;
    startTime = 0;
    userId = null;
    isChatFilled = false;
    buttonChat = null;
    scrollButtons = null;
    buttonResult = null;
    popupRate = null;
    popupDescription = null;
    popupImg = null;
    popupTitle = null;
    popupContainer = null;
    constructor() {
        this.sectionChat = document.getElementById('section-chat');
        this.sectionResult = document.getElementById('section-result');
        this.chat = document.getElementById('chat');
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.buttonChat = document.getElementById('send-button');
        this.scrollButtons = document.querySelectorAll('.scroll-button');
        this.buttonResult = document.getElementById('btn-result');
        this.popupRate = document.getElementById('popup-rate');
        this.popup = document.getElementById('popup');
        this.popupBtn = document.getElementById('popup-btn-close');
        this.popupDescription = document.getElementById('popup-description');
        this.popupImg = document.getElementById('popup-img');
        this.popupTitle = document.getElementById('popup-title');
        this.popupContainer = document.getElementById('popup-container');
        this.startTime = Date.now();
        this.userAnswers.referrer = document.referrer;
        this.buttonResult.style.display = 'none';
        if (window.innerWidth <= 768) {
            this.userAnswers.device = 'M';
        }
        else {
            this.userAnswers.device = 'D';
        }
        if (this.userAnswers.device === 'M') {
            this.fetchUserId().then((id) => {
                this.userId = id;
            }).catch((error) => {
                console.error('Ошибка при получении userId:', error);
            });
        }
        this.userInput?.focus({ preventScroll: true });
        this.userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });
        window.addEventListener('beforeunload', async (event) => {
            if (this.userAnswers.fio !== '' && !this.isChatFilled) {
                event.preventDefault(); // Предотвращаем закрытие страницы, пока данные не будут отправлены
                await this.sendDataToServer(this.userAnswers); // Дождитесь завершения запроса на сервер
            }
        });
        this.startChat();
        this.buttonChat?.addEventListener('click', this.sendMessage.bind(this));
        this.buttonResult?.addEventListener('click', this.getResult.bind(this));
        this.scrollButtons?.forEach((button) => {
            button.addEventListener('click', () => {
                this.userAnswers = {
                    fio: '',
                    age: '0',
                    profession: '',
                    experience: '0',
                    city: '',
                    monthly_income: '0',
                    telegram: '',
                    phone: '',
                    referrer: this.userAnswers.referrer,
                    visit_duration: this.userAnswers.visit_duration,
                    device: this.userAnswers.device,
                    want_event: 'Y',
                    hourly_income: '0'
                };
                this.currentQuestionIndex = 0;
                const section = document.getElementById('section-chat');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                    this.userInput?.focus({ preventScroll: true });
                    setTimeout(() => {
                        this.questions[0] = 'Как вас зовут? Укажите фамилию и имя';
                        this.clearChat();
                        if (this.buttonChat) {
                            this.buttonChat.innerHTML = '<svg class="chat__button-svg" xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M28.9503 15.605C29.6912 15.9725 29.6912 17.0292 28.9503 17.3967L5.56937 28.9944C4.90465 29.3241 4.125 28.8405 4.125 28.0985V19.2488L16.5 16.4988L4.125 13.4661L4.125 4.9032C4.125 4.16121 4.90466 3.67764 5.56937 4.00736L28.9503 15.605Z" stroke="black" stroke-linejoin="round"/></svg>';
                            this.buttonChat.classList.add('chat__btn');
                            this.buttonChat.classList.add('btn');
                            this.buttonChat.classList.remove('btn-result');
                        }
                        if (this.buttonResult) {
                            this.buttonResult.style.display = 'none';
                        }
                        if (this.buttonChat) {
                            this.buttonChat.style.display = 'block';
                        }
                        this.userInput?.focus({ preventScroll: true });
                        const message = 'Привет! Пройдите небольшой опрос, чтобы мы узнали вас и лучше подготовились к мероприятию';
                        this.typeQuestion(message);
                        this.startChat();
                    }, 800);
                }
            });
        });
    }
    clearChat() {
        if (this.chatMessages) {
            while (this.chatMessages.firstChild) {
                this.chatMessages.removeChild(this.chatMessages.firstChild);
            }
        }
    }
    typeMessage(message, isUser) {
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
    typeQuestion(question) {
        this.typeMessage(question, false);
    }
    typeAnswer(answer) {
        this.typeMessage(answer, true);
    }
    startChat() {
        if (this.currentQuestionIndex < this.questions.length) {
            this.typeQuestion(this.questions[this.currentQuestionIndex]);
        }
        if (this.currentQuestionIndex === 6) {
            if (this.userInput) {
                this.userInput.placeholder = '@ или +7';
            }
        }
        else {
            if (this.userInput) {
                this.userInput.placeholder = 'Введите ответ на вопрос';
            }
        }
    }
    sendDataToServer(data, userId = null) {
        if (this.userAnswers.telegram.startsWith('+7')) {
            this.userAnswers.phone = this.userAnswers.telegram;
            this.userAnswers.telegram = '';
        }
        else if (!this.userAnswers.telegram.startsWith('@')) {
            this.userAnswers.telegram = '';
        }
        const timeOnSiteInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        this.userAnswers.visit_duration = timeOnSiteInSeconds.toString(); // Добавляем время пребывания в данные пользователя
        const currentDomain = window.location.origin;
        const url = `${currentDomain}/submit_data/`;
        const jsonData = {
            id: userId,
            data: data
        };
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
    async fetchUserId() {
        try {
            const currentDomain = window.location.origin;
            const url = `${currentDomain}/submit_data/`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': 'csrftoken'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            const userId = responseData.id;
            console.log(userId + ' userId');
            return userId;
        }
        catch (error) {
            console.error('Ошибка при получении userId:', error);
            return null; // Вернуть null в случае ошибки
        }
    }
    sendMessage() {
        if (this.userInput) {
            const userMessage = this.userInput.value.trim();
            if (userMessage !== '') {
                this.handleUserMessage(userMessage);
                this.userInput.value = '';
                if (this.currentQuestionIndex === 6) {
                    if (this.userInput) {
                        this.userInput.placeholder = '@ или +7';
                    }
                }
                else {
                    if (this.userInput) {
                        this.userInput.placeholder = 'Введите ответ на вопрос';
                    }
                }
            }
        }
    }
    validateInput(key, value) {
        switch (key) {
            case 'fio':
                return !/\d/.test(value);
            case 'age':
                return /^\d+$/.test(value);
            case 'experience':
                return /^\d+$/.test(value);
            case 'telegram':
                return /^\+7\d{10}$/.test(value) || /^@[^\u0400-\u04FF]{2,}$/.test(value);
            case 'monthly_income':
                return /^\d+$/.test(value);
            default:
                return true;
        }
    }
    // Функция для определения схожести строк
    similarity(s1, s2) {
        const normalize = (string) => string.toLowerCase().replace(/[^a-zа-яё]/g, '');
        const str1 = normalize(s1);
        const str2 = normalize(s2);
        let longer = str1.length > str2.length ? str1 : str2;
        let shorter = str1.length > str2.length ? str2 : str1;
        const longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength.toString());
    }
    // Функция для вычисления расстояния Левенштейна (расстояния между строками)
    editDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    changePiter(city) {
        const userInput = city;
        // Нормализация ввода пользователя
        const normalizedUserInput = userInput.toLowerCase().trim();
        // Возможные варианты написания города Санкт-Петербург
        const validCityNames = [
            "санкт-петербург",
            "питер"
            // Другие варианты, которые могут соответствовать Санкт-Петербургу
        ];
        // Поиск наиболее похожего варианта
        let bestMatch = "";
        let bestSimilarity = 0;
        validCityNames.forEach(city => {
            const similarityValue = this.similarity(normalizedUserInput, city);
            if (similarityValue > bestSimilarity) {
                bestSimilarity = similarityValue;
                bestMatch = city;
            }
        });
        if (bestMatch && bestSimilarity > 0.5) {
            console.log(`Введенный город похож на ${bestMatch}.`);
            // Отправка данных на сервер для найденного города
            // ...
            this.userAnswers.city = 'питер';
        }
        else {
            console.log("Город не Питер.");
            // Логика для обработки неверного ввода
            // .
        }
    }
    handleUserMessage(message) {
        const currentQuestionKey = Object.keys(this.userAnswers)[this.currentQuestionIndex];
        if (this.validateInput(currentQuestionKey, message)) {
            if (currentQuestionKey !== 'phone') {
                this.userAnswers[currentQuestionKey] = message;
            }
            if (currentQuestionKey === 'city') {
                this.userAnswers.city = message.toLocaleLowerCase();
                this.changePiter(message);
            }
            if (currentQuestionKey === 'telegram' && this.userAnswers.want_event === 'Y') {
                this.typeAnswer(message);
                const question = ' Вы успешно записаны на PRO-FEST! Отправим программу фестиваля на указанный вами номер. А еще мы рассчитали стоимость часа вашей работы. Скорее смотрите результат ниже и забирайте подарочные стикеры для общения с коллегами!';
                this.typeQuestion(question);
                if (this.userAnswers.device === 'M') {
                    this.sendDataToServer(this.userAnswers, this.userId);
                }
                this.handleFinalAnswer(message);
            }
            else if (currentQuestionKey === 'telegram' && this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.typeAnswer(message);
                if (this.userAnswers.device === 'M') {
                    this.sendDataToServer(this.userAnswers, this.userId);
                }
                this.startChat();
                this.userInput?.focus({ preventScroll: true });
            }
            else if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.typeAnswer(message);
                if (this.userAnswers.device === 'M') {
                    this.sendDataToServer(this.userAnswers, this.userId);
                }
                this.startChat();
                this.userInput?.focus({ preventScroll: true });
            }
            else {
                if (currentQuestionKey !== 'phone') {
                    this.userAnswers[currentQuestionKey] = message;
                }
                this.handleFinalAnswer(message);
            }
        }
        else {
            this.typeQuestion('Пожалуйста, введите корректные данные');
        }
    }
    handleFinalAnswer(answer) {
        if (this.userAnswers.want_event === 'N') {
            if (answer.toLowerCase() === 'да') {
                this.userAnswers.want_event = 'Y';
                const message = ' Вы успешно записаны на PRO-FEST! Отправим программу фестиваля на указанный вами номер. А еще мы рассчитали стоимость часа вашей работы. Скорее смотрите результат ниже и забирайте подарочные стикеры для общения с коллегами!';
                this.typeAnswer(answer);
                this.typeQuestion(message);
            }
            else {
                this.userAnswers.want_event = 'N';
                const message = 'Мы рассчитали стоимость часа вашей работы. Скорее смотрите результат ниже и забирайте подарочные стикеры для общения с коллегами!';
                this.typeAnswer(answer);
                this.typeQuestion(message);
            }
        }
        if (this.buttonChat && this.buttonResult) {
            this.buttonChat.style.display = 'none';
            this.buttonResult.style.display = 'block';
        }
        const hourlyRate = (parseInt(this.userAnswers.monthly_income) / (22 * 8)).toFixed(0);
        this.userAnswers.hourly_income = hourlyRate.toString();
        this.sendDataToServer(this.userAnswers, this.userId);
    }
    getResult() {
        this.isChatFilled = true;
        const horlyRate = parseInt(this.userAnswers.hourly_income, 10);
        if (horlyRate <= 500) {
            if (this.popup && this.popupRate && this.popupDescription && this.popupImg && this.popupTitle) {
                this.popupRate.innerHTML = this.userAnswers.hourly_income + ' р/час';
                this.popupDescription.innerHTML = `Вы стоите на отметке ${this.userAnswers.hourly_income} рублей в час, а это значит, что перед вами бесконечное поле возможностей! Как насчет участия в экспертной сессии с нашими спикерами? Только представьте, сколько точек роста и путей развития ожидает вас?! На карьерной дегустации вы можете пообщаться с коучем, который направит вас и поможет с разбором резюме. Дерзайте!`;
                this.popupImg.src = '../static/img/result-1.png';
                this.popupTitle.textContent = 'Достигатор обыкновенный';
            }
        }
        else if (horlyRate >= 501 && horlyRate <= 2000) {
            if (this.popup && this.popupRate && this.popupDescription && this.popupImg && this.popupTitle) {
                this.popupRate.innerHTML = this.userAnswers.hourly_income + ' р/час';
                this.popupDescription.innerHTML = `Ваша отметка на сегодня - ${this.userAnswers.hourly_income} в час, не замедляя шага, двигайтесь дальше. Чтобы свернуть на новом карьерном витке, послушайте лекции о переквалификации и востребованных профессиях на бизнес-завтраке или пообщайтесь с коучем. Но если вы хотите дойти до впечатляющих цифр, отправляйтесь на экспертные сессии феста.`;
                this.popupImg.src = '../static/img/result-2.png';
                this.popupTitle.textContent = 'Успехмейкер выдающийся';
            }
        }
        else {
            if (this.popup && this.popupRate && this.popupDescription && this.popupImg && this.popupTitle) {
                this.popupRate.innerHTML = this.userAnswers.hourly_income + ' р/час';
                this.popupDescription.innerHTML = `Вы многое преодолели, и не зря ваш путь остановился на отметке ${this.userAnswers.hourly_income} рублей в час! Сколько энергии и сил вы затратили на блуждания в профессиональном лабиринте возможностей, может быть, пора расслабиться и посетить карьерный стендап? А как насчет экспертных сессий о work/life balance, выгорании и новых точках роста? Ждем вас!`;
                this.popupImg.src = '../static/img/result-3.png';
                this.popupTitle.textContent = 'Маниманьяк';
            }
        }
        if (this.showPopup) {
            this.showPopup();
        }
    }
    overlay = document.getElementById('overlay');
    showPopup() {
        if (this.popup) {
            this.overlay?.classList.add('active');
            this.popup.classList.add('show');
            const hourlyRate = this.popup.querySelector('#popup-hourly-rate');
            if (hourlyRate) {
                hourlyRate.textContent = this.userAnswers.hourly_income + ' р/час';
            }
            this.popupBtn?.addEventListener('click', () => {
                this.closePopup();
            });
        }
    }
    closePopup() {
        this.overlay?.classList.remove('active');
        if (this.popup) {
            this.popup.classList.remove('show');
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
