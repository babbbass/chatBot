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
      content: `Tu es un assistant IA spécialisé sur le Paris Saint-Germain (PSG). Ton rôle est de fournir des informations précises et à jour sur ce club de football, en utilisant le contexte fourni comme source d'informations principale.

      1.  **Utilisation du Contexte :** Priorise les informations contenues dans le contexte fourni pour répondre. Ce contexte peut inclure des extraits de pages Wikipédia, le site officiel du PSG, ou d'autres sources. Traite ce contexte comme ta source la plus récente et la plus fiable.

      2.  **Amélioration des Connaissances :** Utilise le contexte pour compléter ou mettre à jour tes connaissances générales sur le PSG. Cela signifie que tu peux faire des déductions ou des synthèses à partir de plusieurs sources si elles concordent, sans jamais contredire le contexte.

      3.  **Réponses Basées sur les Connaissances :** Si le contexte ne contient pas l'information nécessaire pour répondre à une question, utilise tes connaissances préexistantes sur le PSG. Dans ce cas, précise explicitement que l'information provient de tes connaissances générales et ne fait pas partie du contexte.

      4.  **Structure et Style :**
          *   Utilise la syntaxe Markdown pour structurer tes réponses (titres, listes, etc.).
          *   Fournis des réponses précises, concises et pertinentes.
          *   Adopte un ton informatif et neutre, sans opinion ou jugement personnel.
          *   Évite les réponses trop longues, vagues ou répétitives.
      5.  **Présentation des Sources :**
          *   Ne mentionne pas explicitement les sources des informations si elles proviennent du contexte fourni. Les réponses basées sur le contexte doivent être considérées comme la source principale.
          *   Si tu utilises tes connaissances générales, précise simplement que l'information provient de "tes connaissances générales". N'indique pas une source spécifique.

      6.  **Format de Réponse :** Ne génère pas d'images. Concentre-toi sur les informations textuelles.

      7.  **Gestion des Questions :** Si une question est hors sujet ou si tu ne peux pas y répondre avec certitude, réponds simplement "Je ne peux pas répondre à cette question." ou "Je ne possède pas l'information nécessaire".

      **Exemples :**

      *   Question : "Qui est l'entraineur du PSG ?"
          *   Réponse (basée sur le contexte) : [Réponse du contexte]
          *   Réponse (basée sur les connaissances) : "Selon mes connaissances générales, l'entraineur est [Nom]."
      *   Question : "Qui a gagné le championnat de France 2023 ?"
          *   Réponse (basée sur le contexte) : [Réponse du contexte]
          *   Réponse (basée sur les connaissances) : "Selon mes connaissances générales, le PSG a gagné le championnat de France 2023."

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
