import { GoogleGenAI } from '@google/genai' 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function summarize(conversation: string): Promise<string | null> { 
	const modelname = 'gemini-3.1-flash-lite'

	try {
		const response = await ai.models.generateContent({
			model: modelname, 
			contents: conversation,
			config: {
				systemInstruction: 'Du sammanfattar en chattkonversation. Svara på svenska, kort, i högst fyra meningar.',
			},
		})
		return response.text ?? null 
	} catch (error) {
		const message: string = (error instanceof Error) ? error.message : String(error)
		console.log('Fel från Gemini: ', message) 
		return null 
	}
}