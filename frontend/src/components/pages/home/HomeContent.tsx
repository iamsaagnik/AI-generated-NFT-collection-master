import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { enqueueSnackbar } from 'notistack'
import { AxiosResponse } from 'axios'
import { Network, testnetNetwork } from '../../../contracts'
import { axiosInstance } from '../../../config/common/axios.config'
import { FAQ } from '../../layout/FAQ'
import { GenerationForm } from './GenerationForm'
import { PicturesLoop } from './PicturesLoop'
import { DeploymentButtons } from './DeploymentButtons'
/*
|--------------------------------------------------------------------------
| Contracts
|--------------------------------------------------------------------------
*/
export interface BodyProps {}

export interface FormikInitialValues {
	wallet: string | null
	network: string | null
	collectionName: string | null
	nbPictures: string | null
	prompt: string | null
}

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/
const initialValues: FormikInitialValues = Object.freeze({
	wallet: '',
	network: '',
	collectionName: '',
	nbPictures: '',
	prompt: '',
})

const FormValidationSchema = Yup.object().shape({
	wallet: Yup.string()
		.required()
		.matches(/(0x[a-fA-F0-9]{40}$)/g),
	network: Yup.mixed<Network>().oneOf(Object.values(Network)).required(),
	collectionName: Yup.string().required(),
	nbPictures: Yup.number().required().min(0).max(10),
	prompt: Yup.string().required(),
})

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/
export const HomeContent: React.FC<BodyProps> = () => {
	const [pictures, setPictures] = useState([])
	const [formBody, setBody] = useState(initialValues)
	const [isTestnet, setTestnet] = useState(false)
	const [isDeployed, setDeployment] = useState(false)
	const [isGenerated, setGeneration] = useState(false)
	const [isDeploymentLoading, setDeploymentLoading] = useState(false)
	const [isDeploymentError, setDeploymentError] = useState(false)

	// Methods
	// ----------------------------------------------------------------------------
	const generatePictures = async (body: FormikInitialValues): Promise<void> => {
		// setGeneration(false)
		setBody(body)

		if (!body.network) return

		if (testnetNetwork.includes(body.network)) {
			setTestnet(true)
		} else {
			setTestnet(false)
		}

		try {
			console.log('TRY - GENERATE')
			const res: AxiosResponse<any> = await axiosInstance.post('generate', {
				...body,
			})
			setDeploymentLoading(false)
			setDeployment(true)
			setGeneration(true)

			setDeploymentError(false)
			setDeployment(false)

			setPictures(res.data.pictures)
			enqueueSnackbar('200 - Pictures successfully generated', {
				variant: 'success',
			})
		} catch (e: any) {
			enqueueSnackbar(`${e.response.status} - ${e.response.data.message}`, {
				variant: 'error',
			})
		}
	}

	// Render
	//--------------------------------------------------------------------------
	return (
		<Box maxWidth={1192} display="flex" flexDirection="column" gap={15} marginX="auto" marginTop={10} padding={5}>
			<Typography variant="h2" fontWeight={600}>
				Create your NFT collection{' '}
				<Typography color="secondary.main" variant="h2" component="span">
					generated by AI
				</Typography>
			</Typography>

			<Box display="flex" flexDirection="column" justifyContent="space-between" gap={7}>
				<Box display="flex" flexDirection="column" gap={2}>
					<Typography variant="h3" textTransform="uppercase">
						Collection parameters
					</Typography>
					<Typography color="text.secondary" variant="body1">
						We understand your eagerness to create your NFT collection. To do so, enter all the details for
						your collection. Enter a prompt and click generate to discover the visual assets of your NFTs.
						You can regenerate assets. When satisfied, click deploy to create your collection.
					</Typography>
				</Box>

				<Formik
					initialValues={initialValues}
					validationSchema={FormValidationSchema}
					onSubmit={generatePictures}
				>
					<Form>
						<Box display="flex" flexDirection="column" justifyContent="space-between" gap={15}>
							<GenerationForm
								isDeploymentLoading={isDeploymentLoading}
								setDeploymentLoading={setDeploymentLoading}
							/>
							{isGenerated ? <PicturesLoop pictures={pictures} isGenerated={isGenerated} /> : null}
							{isGenerated ? (
								<DeploymentButtons
									pictures={pictures}
									formBody={formBody}
									isTestnet={isTestnet}
									isGenerated={isGenerated}
									isDeployed={isDeployed}
									setDeployment={setDeployment}
									isDeploymentError={isDeploymentError}
									setDeploymentError={setDeploymentError}
									isDeploymentLoading={isDeploymentLoading}
									setDeploymentLoading={setDeploymentLoading}
								/>
							) : null}
						</Box>
					</Form>
				</Formik>
			</Box>

			<FAQ />
		</Box>
	)
}
