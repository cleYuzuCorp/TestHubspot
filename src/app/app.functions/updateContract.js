exports.main = (context = {}, sendResponse) => {
  const { startDate, endDate, price } = context.parameters

  return updateContract(startDate, endDate, price)
    .then(() => {
      sendResponse({ status: 'success' })
    })
    .catch((e) => {
      sendResponse({ status: 'error', message: e.message })
    })
}

const updateContract = (startDate, endDate, price) => {

  const Months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  if (startDate && endDate && price) {
    const startMonth = startDate.month
    const startYear = startDate.year
    const endMonth = endDate.month
    const endYear = endDate.year
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

    return Promise.resolve(contracts)
  } else {
    return Promise.reject(new Error('Invalid input data'))
  }
}