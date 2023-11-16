let startTime: number = 0 // Переменная для хранения времени начала посещения

function saveVisitTime (): void {
  startTime = new Date().getTime()
  localStorage.setItem('visitTime', startTime.toString())
}

function sendVisitTimePeriodically (): void {
  setInterval(() => {
    const visitTime: string | null = localStorage.getItem('visitTime')
    if (visitTime) {
      const currentTime: number = new Date().getTime()
      const elapsedTime: number = currentTime - startTime

      const requestData = {
        id: localStorage.getItem('userId'),
        data: {
          visit_duration: elapsedTime.toString()
        }
      }

      // Здесь отправляем данные на сервер
      fetch('/your-server-endpoint', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.json()
        })
        .then(responseData => {
          console.log('Ответ сервера:', responseData)
        })
        .catch(error => {
          console.error('Произошла ошибка:', error)
        })
    }
  }, 10000) // Отправляем данные каждые 10 секунд (в миллисекундах)
}

saveVisitTime()
sendVisitTimePeriodically()
