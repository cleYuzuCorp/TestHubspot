import React, { useState, useEffect, useCallback } from "react"
import {
  Alert,
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

hubspot.extend<'crm.record.tab'>(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    addAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
  />
))

const Extension = ({ context, runServerless, addAlert, fetchProperties }) => {

  const [startDate, setStartDate] = useState({ year: 0, month: 0, date: 0, formattedDate: "" })
  const [startDateTemp, setStartDateTemp] = useState({ year: 0, month: 0, date: 0, formattedDate: "" })
  const [endDate, setEndDate] = useState({ year: 0, month: 0, date: 0, formattedDate: "" })
  const [endDateTemp, setEndDateTemp] = useState({ year: 0, month: 0, date: 0, formattedDate: "" })
  const [price, setPrice] = useState(0)
  const [priceTemp, setPriceTemp] = useState(0)

  const [contracts, setContracts] = useState<{ month: string, amount: number }[]>([]);

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
      const contracts: { month: string, amount: number }[] = []

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

  const handleSubmit = useCallback(() => {
    runServerless({
      name: 'updateContract',
      parameters: {
        startDate: startDateTemp,
        endDate: endDateTemp,
        price: priceTemp
      },
    }).then((resp) => {
      if (resp.status === 'SUCCESS') {
        addAlert({
          type: 'success',
          message: 'Modification effectué avec succès',
        })
        setStartDate(startDateTemp)
        setEndDate(endDateTemp)
        setPrice(priceTemp)
      } else {
        setError(resp.message || 'An error occurred')
      }
    })
  }, [startDateTemp, endDateTemp, priceTemp, runServerless, addAlert])

  if (error !== '') {
    return <Alert title="Error" variant="error" >{error}</Alert>
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
              if (date && date.formattedDate) {
                setStartDateTemp({
                  year: date.year,
                  month: date.month,
                  date: date.date,
                  formattedDate: date.formattedDate
                });
              }
            }}
          />
          <DateInput
            name="end-date"
            label="Date de fin de contrat"
            value={endDateTemp}
            onChange={(date) => {
              if (date && date.formattedDate) {
                setEndDateTemp({
                  year: date.year,
                  month: date.month,
                  date: date.date,
                  formattedDate: date.formattedDate
                });
              }
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
