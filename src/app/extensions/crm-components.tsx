import React, { useState, useEffect, useCallback } from "react"
import {
    Alert,
    Flex,
    Heading,
    Input,
    hubspot,
} from "@hubspot/ui-extensions"
import { CrmAssociationPivot, CrmDataHighlight, CrmPropertyList, CrmReport, CrmStageTracker, CrmActionButton, CrmActionLink, CrmCardActions } from '@hubspot/ui-extensions/crm'

hubspot.extend<'crm.record.tab'>(({ context, actions, runServerlessFunction }) => (
    <CRMComponents
        context={context}
        runServerless={runServerlessFunction}
        fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
        addAlert={actions.addAlert}
    />
))

const CRMComponents = ({ context, runServerless, fetchCrmObjectProperties, addAlert }: { context: any, runServerless: any, addAlert: any, fetchCrmObjectProperties: any }) => {

    const [contactId, setContactId] = useState()
    const [name, setName] = useState('')
    const [error, setError] = useState('')

    const dealContext = {
        objectTypeId: "0-3",
        objectId: 15843406592,
    }

    const associateContext = {
        objectTypeId: "0-3",
        association: {
            objectTypeId: "0-1",
            objectId: 769851,
        }
    }

    useEffect(() => {
        fetchCrmObjectProperties(['lastname', 'hs_object_id']).then(
            (properties: { [propertyName: string]: any }) => {
                setName(properties.lastname)
                setContactId(properties.hs_object_id)
            }
        )
    }, [fetchCrmObjectProperties])

    const handleNameChange = useCallback(
        (newName: React.SetStateAction<string>) => {
            runServerless({
                name: 'updateName',
                parameters: {
                    contactId: contactId,
                    name: newName,
                },
            }).then((resp: { status: string; message: string }) => {
                if (resp.status === 'SUCCESS') {
                    addAlert({
                        type: 'success',
                        message: 'Name updated successfully',
                    })
                    setName(newName)
                } else {
                    setError(resp.message || 'An error occurred')
                }
            })
        },
        [contactId, name, addAlert, runServerless]
    )

    console.log(name, "name")

    if (error !== '') {
        return <Alert title="Error" variant="error">{error}</Alert>
    }

    return (
        <>
            <Flex direction="column" gap="lg">
                <Flex direction="column" gap="md">
                    <Heading>Pivot d'association</Heading>
                    <CrmAssociationPivot
                        objectTypeId="0-3"
                        maxAssociations={10}
                    />
                </Flex>

                <Flex direction="column" gap="md">
                    <Heading>Liste de propriété</Heading>
                    <CrmDataHighlight
                        properties={["firstname", "lastname", "email", "createdate", "lastmodifieddate"]}
                    />
                </Flex>

                <Flex direction="column" gap="md">
                    <Heading>Liste de propriété orienté</Heading>
                    <CrmPropertyList
                        properties={['firstname', 'lastname', 'email', 'createdate', 'lastmodifieddate']}
                        direction="row"
                    />
                </Flex>

                <Flex direction="column" gap="md">
                    <Heading>Rapport</Heading>
                    <CrmReport reportId="103423286" />
                </Flex>

                <Flex direction="column" gap="md">
                    <Heading>Suivi de Transaction</Heading>

                    <CrmStageTracker
                        objectId="15843406592"
                        objectTypeId="0-3"
                        properties={[
                            'dealname',
                            'amount',
                        ]}
                    />
                </Flex>

                <Flex direction="column" gap="md">
                    <Heading>Boutons d'actions</Heading>

                    <Flex justify="center" gap="md">
                        <CrmActionButton
                            actionType="PREVIEW_OBJECT"
                            actionContext={dealContext}
                            variant="secondary"
                        >
                            Preview existing Deal
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="OPEN_RECORD_ASSOCIATION_FORM"
                            actionContext={associateContext}
                            variant="primary"
                        >
                            Create new Deal
                        </CrmActionButton>
                    </Flex>

                    <CrmActionLink
                        actionType="ADD_NOTE"
                        actionContext={dealContext}
                    >
                        Add a note about this deal to the record
                    </CrmActionLink>

                    <CrmCardActions
                        actionType="PREVIEW_OBJECT"
                        actionConfigs={[
                            {
                                type: "action-library-button",
                                label: "Preview",
                                actionType: "PREVIEW_OBJECT",
                                actionContext: {
                                    objectTypeId: "0-3",
                                    objectId: 15843406592
                                },
                                tooltipText: "Preview this deal record."
                            },
                            {
                                type: "dropdown",
                                label: "Activities",
                                options: [
                                    {
                                        type: "action-library-button",
                                        label: "Send email",
                                        actionType: "SEND_EMAIL",
                                        actionContext: {
                                            objectTypeId: "0-3",
                                            objectId: 15843406592
                                        }
                                    },
                                    {
                                        type: "action-library-button",
                                        label: "Add note",
                                        actionType: "ADD_NOTE",
                                        actionContext: {
                                            objectTypeId: "0-3",
                                            objectId: 15843406592
                                        },
                                    }
                                ]
                            }
                        ]}
                    />

                    <Flex justify="center" wrap="wrap" gap="md">
                        <CrmActionButton
                            actionType="ADD_NOTE"
                            actionContext={{
                                objectTypeId: "0-3",
                                objectId: 15843406592
                            }}
                            variant="secondary"
                        >
                            Create note
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="SEND_EMAIL"
                            actionContext={{
                                objectTypeId: "0-3",
                                objectId: 15843406592
                            }}
                            variant="secondary"
                        >
                            Send email
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="SCHEDULE_MEETING"
                            actionContext={{
                                objectTypeId: '0-3',
                                objectId: 15843406592
                            }}
                        >
                            Schedule meeting
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="OPEN_RECORD_ASSOCIATION_FORM"
                            actionContext={{
                                objectTypeId: '0-2',
                                association: {
                                    objectTypeId: '0-1',
                                    objectId: 15843406592
                                }
                            }}
                        >
                            Create new record
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="ENGAGEMENT_APP_LINK"
                            actionContext={{
                                objectTypeId: "0-3",
                                objectId: 15843406592,
                                engagementId: 41962521245
                            }}
                            variant="secondary"
                        >
                            Open note
                        </CrmActionButton>

                        <CrmActionButton
                            actionType="RECORD_APP_LINK"
                            actionContext={{
                                objectTypeId: "0-3",
                                objectId: 15843406592,
                                includeEschref: true
                            }}
                            variant="secondary"
                        >
                            View company
                        </CrmActionButton>
                    </Flex>
                </Flex>

                <Flex direction="column" gap="md">
                    <Heading>Modification d'un contact</Heading>

                    <Input
                        name="name"
                        label="Nom du contact"
                        value={name}
                        onChange={handleNameChange}
                    />
                </Flex>
            </Flex >
        </>
    )
}