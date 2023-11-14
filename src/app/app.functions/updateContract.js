const axios = require('axios')

exports.main = (context = {}, sendResponse) => {
  const { startDay, endDay, startDate, endDate, price } = context.parameters
  const token = "pat-na1-35d12fcb-c3a8-4413-815c-679d2437ead0"

  return updateContract(token, startDay, endDay, startDate, endDate, price)
    .then((data) => {
      sendResponse({ status: 'success', data: { data } })
    })
    .catch((e) => {
      sendResponse({ status: 'error', message: e.message })
    })
}

const updateContract = (token, startDay, endDay, startDate, endDate, price) => {
  return new Promise((resolve, reject) => {
    const Months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

    if (startDate && endDate && price) {
      const startMonth = startDate.month
      const startYear = startDate.year
      const endMonth = endDate.month
      const endYear = endDate.year

      const startTimestamp = new Date(startYear, startMonth, startDay).getTime()
      const endTimestamp = new Date(endYear, endMonth, endDay).getTime()
      
      const contracts = []

      const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1
      const contractAmountPerMonth = price / totalMonths

      for (let year = startYear; year <= endYear; year++) {
        const start = year === startYear ? startMonth : 0
        const end = year === endYear ? endMonth : 11

        for (let month = start; month <= end; month++) {
          contracts.push({ month: Months[month] + ' ' + year, amount: contractAmountPerMonth })
        }
      }

      return axios.post(
        `https://api.hubapi.com/cms/v3/hubdb/tables/7410851/rows`,
        {
          values: {
            start_date: startTimestamp,
            end_date: endTimestamp,
            price: price
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      ).then(() => {
        return resolve(contracts)
      })
    } else {
      return reject(new Error('Invalid input data'))
    }
  })
}