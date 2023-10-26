import React, { useState, useEffect, useCallback } from "react"
import {
  Button,
  Text,
  Flex,
  hubspot,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  DateInput,
  NumberInput,
} from "@hubspot/ui-extensions"

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    addAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
    openIframeModal={actions.openIframeModal}
  />
))

const Extension = ({ runServerless, addAlert, fetchProperties, openIframeModal }) => {

  const [startDate, setStartDate] = useState()
  const [startDateTemp, setStartDateTemp] = useState()
  const [endDate, setEndDate] = useState()
  const [endDateTemp, setEndDateTemp] = useState()
  const [price, setPrice] = useState(0)
  const [priceTemp, setPriceTemp] = useState(0)

  const [contracts, setContracts] = useState([])

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  const [error, setError] = useState("")

  const Months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  useEffect(() => {
    fetchProperties(["firstname", "lastname", "email", "createdate", "lastmodifieddate"])
      .then(properties => {
        setFirstName(properties.firstname)
        setLastName(properties.lastname)
        setEmail(properties.email)

        const createDateTimestamp = properties.createdate
        const createDate = new Date(parseInt(createDateTimestamp))
        const createYear = createDate.getFullYear()
        const createMonth = createDate.getMonth()
        const createDateOfMonth = createDate.getDate()
        const createFormattedDate = createDate.toLocaleDateString()
        const formattedCreate = { year: createYear, month: createMonth, date: createDateOfMonth, formattedDate: createFormattedDate }

        const lastModifiedDateTimestamp = properties.lastmodifieddate
        const lastModifiedDate = new Date(parseInt(lastModifiedDateTimestamp))
        const lastModifiedYear = lastModifiedDate.getFullYear()
        const lastModifiedMonth = lastModifiedDate.getMonth()
        const lastModifiedDateOfMonth = lastModifiedDate.getDate()
        const lastModifiedFormattedDate = lastModifiedDate.toLocaleDateString()
        const formattedLastModified = { year: lastModifiedYear, month: lastModifiedMonth, date: lastModifiedDateOfMonth, formattedDate: lastModifiedFormattedDate }

        setStartDateTemp(formattedCreate)
        setEndDateTemp(formattedLastModified)
      })
  }, [fetchProperties])

  useEffect(() => {
    setContracts(calculateContracts())
  }, [startDate, endDate, price])

  const calculateContracts = () => {
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
      return contracts
    }
    return []
  }

  const executeServerless = useCallback(() => {
    runServerless({
      name: "myFunc",
    }).then((resp) => {
      if (resp.status === 'SUCCESS') {
        addAlert({
          type: 'success',
          message: 'Modification effectué avec succès !',
        });
      } else {
        setError(resp.message || 'An error occurred');
      }
    })
  }, [addAlert, runServerless])

  const handleSubmit = () => {
    setStartDate(startDateTemp)
    setEndDate(endDateTemp)
    setPrice(priceTemp)
    executeServerless
  }

  return (
    <>
      <Flex direction="column" gap="lg">
        <Flex justify="center" gap="lg">
          <DateInput
            name="start-date"
            label="Date de début de contrat"
            value={startDateTemp}
            onChange={(date) => {
              setStartDateTemp(date)
            }}
          />
          <DateInput
            name="end-date"
            label="Date de fin de contrat"
            value={endDateTemp}
            onChange={(date) => {
              setEndDateTemp(date)
            }}
          />
        </Flex>

        <Flex justify="center">
          <NumberInput
            name="price"
            label="Montant du contrat"
            min={0}
            value={priceTemp}
            onChange={(price) => {
              setPriceTemp(price)
            }}
          />
        </Flex>

        <Flex justify="center">
        <Button variant="primary" onClick={handleSubmit}>
            Enregistrer
          </Button>
        </Flex>

        <Text>Hello {firstName} {lastName}, your email : {email}</Text>

        <Table bordered={true}>
          <TableHead>
            <TableRow>
              <TableHeader>Mois</TableHeader>
              <TableHeader>Montant/Durée</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => <TableRow>
              <TableCell>{contract.month}</TableCell>
              <TableCell>{contract.amount}</TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
      </Flex>
    </>
  )
}
