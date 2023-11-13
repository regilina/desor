// Получение информации о реферере (предыдущей странице)
const referrer: string = document.referrer

// Данные для отправки на сервер
const data = {
    referrer: referrer
}

// Опции запроса
const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}

// URL для отправки данных
const serverURL = 'ваш_сервер/путь_обработчика'

console.log(data)

// Отправка данных на сервер
// fetch(serverURL, requestOptions)
//     .then(response => {
//         // Обработка ответа от сервера
//         if (response.ok) {
//             return response.json();
//         }
//         throw new Error('Network response was not ok.');
//     })
//     .then(data => {
//         // Обработка данных от сервера
//         console.log('Ответ сервера:', data);
//     })
//     .catch(error => {
//         // Обработка ошибок
//         console.error('Произошла ошибка:', error);
//     });
