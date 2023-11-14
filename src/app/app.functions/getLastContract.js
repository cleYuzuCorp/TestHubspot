const axios = require('axios')

exports.main = (context = {}, sendResponse) => {
    const { contracts } = context.parameters
    const token = "pat-na1-35d12fcb-c3a8-4413-815c-679d2437ead0"
    return getLastContract(token, contracts)
        .then((data) => {
            sendResponse({ status: 'success', data: data.data })
        })
        .catch((e) => {
            sendResponse({ status: 'error', message: e.message })
        })
}

const getLastContract = (token, contracts) => {
    return axios.get(
        `https://api.hubapi.com/cms/v3/hubdb/tables/7410851/rows`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        }
    )
}