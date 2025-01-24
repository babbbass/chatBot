import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"
import OpenAi from "openai"
import "dotenv/config"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env

const openai = new OpenAi({
  apiKey: OPENAI_API_KEY,
})

const psgData = [
  "https://www.psg.fr/",
  "https://fr.wikipedia.org/wiki/Paris_Saint-Germain_Football_Club",
  "https://www.lequipe.fr/Football/FootballFicheClub26.html",
  "https://www.instagram.com/psg/",
  "https://www.footparisien.com/",
  "https://www.lequipe.fr/Football/Actualites/Neymar-mbappe-kvaratskhelia-le-top-10-des-transferts-les-plus-chers-de-l-histoire-du-psg/1533164",
  "https://www.les-transferts.com/ca-buzze/mercato-les-plus-gros-transferts-de-lhistoire-du-psg.html",
  "https://www.footmercato.net/club/psg/salaires",
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
})

const createCollection = async (similarityMetric: SimilarityMetric) => {
  const response = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric,
    },
  })

  console.log(response)
}

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION)

  for await (const url of psgData) {
    const content = await scrapePage(url)
    const chunks = await splitter.splitText(content)
    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      })

      const vector = embedding.data[0].embedding

      const response = await collection.insertOne({
        $vector: vector,
        text: chunk,
      })

      console.log(response)
    }
  }
}

const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML)
      await browser.close()
      return result
    },
  })

  return (await loader.scrape())?.replace(/<[^>]*>?/gm, "")
}

createCollection("dot_product").then(() => loadSampleData())
