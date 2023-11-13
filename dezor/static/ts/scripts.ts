let startTime: number = 0 // Переменная для хранения времени начала посещения

// Функция для сохранения времени начала посещения
function saveVisitTime (): void {
  startTime = new Date().getTime() // Получаем текущее время в миллисекундах при загрузке страницы
  localStorage.setItem('visitTime', startTime.toString()) // Сохраняем время посещения в локальное хранилище
}

// Функция для отправки значения времени посещения при закрытии сайта
function sendVisitTimeOnClose (): void {
  window.addEventListener('beforeunload', () => {
    const visitTime: string | null = localStorage.getItem('visitTime') // Получаем сохраненное время посещения
    if (visitTime) {
      const endTime: number = new Date().getTime() // Получаем текущее время при закрытии страницы
      const elapsedTime: number = endTime - startTime // Вычисляем прошедшее время
      console.log(`Время на сайте: ${elapsedTime} миллисекунд`) // Выводим время в консоль

      // Здесь можно отправить это значение на сервер, используя, например, AJAX или Fetch
      // Например:
      // fetch('ваш_сервер/путь_для_отправки_времени', {
      //   method: 'POST',
      //   body: JSON.stringify({ visitTime }),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
    }
  })
}

// Вызываем функцию сохранения времени посещения при загрузке страницы
saveVisitTime()

// Вызываем функцию отправки времени посещения при закрытии страницы
sendVisitTimeOnClose()
