try {
    const response = await fetch(
        `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
      )
  
      const blob = await response.blob()
  
      const loader = new PDFLoader(blob)
  
      const pageLevelDocs = await loader.load()
  
      const pagesAmt = pageLevelDocs.length
  
      const { subscriptionPlan } = metadata
      const { isSubscribed } = subscriptionPlan
  
      const isProExceeded =
        pagesAmt >
        PLANS.find((plan) => plan.name === 'Pro')!.pagesPerPdf
      const isFreeExceeded =
        pagesAmt >
        PLANS.find((plan) => plan.name === 'Free')!
          .pagesPerPdf
  
      if (
        (isSubscribed && isProExceeded) ||
        (!isSubscribed && isFreeExceeded)
      ) {
        await db.file.update({
          data: {
            uploadStatus: 'FAILED',
          },
          where: {
            id: createdFile.id,
          },
        })
      }
  
      // vectorize and index entire document
      const pinecone = await getPineconeClient()
      const pineconeIndex = pinecone.Index('quill')
  
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      })
  
      await PineconeStore.fromDocuments(
        pageLevelDocs,
        embeddings,
        {
          pineconeIndex,
          namespace: createdFile.id,
        }
      )
  
      await db.file.update({
        data: {
          uploadStatus: 'SUCCESS',
        },
        where: {
          id: createdFile.id,
        },
      })
} catch (error) {
    
}