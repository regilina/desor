// Получение информации о реферере (предыдущей странице)
const referrer = document.referrer

// Получение информации о типе устройства (desktop или mobile)
let device = 'desktop' // По умолчанию предполагаем, что это рабочий стол

// Проверяем ширину экрана для определения типа устройства
if (window.innerWidth < 768) {
    device = 'mobile' // Если ширина экрана меньше 768px, считаем это мобильным устройством
}

// Данные для отправки на сервер
const data = {
    id: null,
    data: {
        device: device,
        referrer: referrer
    }
}

// Опции запроса
const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}

// URL для отправки данных
const serverURL = '/your-server-endpoint'

console.log(data)

// Отправка данных на сервер
fetch(serverURL, requestOptions)
    .then(response => {
        // Обработка ответа от сервера
        if (response.ok) {
            return response.json()
        }
        throw new Error('Network response was not ok.')
    })
    .then(data => {
        // Обработка данных от сервера
        console.log('Ответ сервера:', data)

        // Предположим, что сервер возвращает id в поле data.id
        const userId = data.id

        // Здесь вы можете сохранить serverId в нужном вам месте
        // Например, можно сохранить в localStorage
        localStorage.setItem('userId', userId)

        // Или просто использовать его сразу
        // например, присвоить его переменной, доступной в других частях кода
        // myForm.id = serverId;
    })
    .catch(error => {
        // Обработка ошибок
        console.error('Произошла ошибка:', error)
    })
