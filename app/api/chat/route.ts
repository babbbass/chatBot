import OpenAI from "openai"
import { streamText } from "ai"
import { DataAPIClient } from "@datastax/astra-db-ts"
import { openai } from "@ai-sdk/openai"

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env

const chatGpt = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    const latestMessage = messages.at(-1).content
    let docContext = ""
    const embedding = await chatGpt.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    })

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION)

      const cursor = await collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      })

      const documents = await cursor.toArray()

      const docsMap = documents?.map((doc) => doc.text)

      docContext = JSON.stringify(docsMap)
    } catch (error) {
      console.log("Error querying", error)
      docContext = ""
    }

    const template = {
      role: "system",
      content: `Tu es un assistant IA qui sait tout sur à propos du club de football Paris Saint Germain appelé aussi PSG.
      Utilise le contexte ci dessous pour augmenter ou améliorer ce que tu connais à propos de l'histoire et de l'actualité du PSG.
      Le contexte te fournira la plus récente page wikipedia, le site officiel du Paris Saint Germain et d'autres sites.
      Si le contexte n'inclut pas les informations dont tu as besoin pour structurer ta réponse basé sur les connaissances que tu as acquis
      et ne mentionne pas les sources de tes informations.
      Tes réponses doivent utilisés le markdown et ne retourne pas d'images.

      ------------
      START CONTEXT
      ${docContext}
      END CONTEXT
      ------------
      QUESTION: ${latestMessage}
      ------------
      `,
    }

    // const response = await openaii.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   stream: true,
    //   messages: [
    //     template,
    //     ...messages.map((msg) => ({ ...msg, role: msg.role.toString() })),
    //   ],
    //   max_tokens: 2000,
    // })

    // Convertir la réponse en stream
    const stream = streamText({
      model: openai("gpt-3.5-turbo"),
      //stream: true,
      messages: [
        template,
        ...messages.map((msg) => ({ ...msg, role: msg.role.toString() })),
      ],
      maxTokens: 2000,
    })
    return stream.toDataStreamResponse()
  } catch (error) {
    console.log(error)
  }
}
