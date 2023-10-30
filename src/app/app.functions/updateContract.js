exports.main = (context = {}, sendResponse) => {
  const { startDate, endDate, price } = context.parameters

  return updateContract(startDate, endDate, price)
    .then((data) => {
      sendResponse({ status: 'success', data: {data} })
    })
    .catch((e) => {
      sendResponse({ status: 'error', message: e.message })
    })
}

const updateContract = (startDate, endDate, price) => {
return new Promise((resolve,reject)=>{
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
    
    return resolve(contracts)
  } else {
    return reject(new Error('Invalid input data'))
  }
})
}