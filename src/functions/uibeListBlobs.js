import { app } from "@azure/functions"; 
import { BlobServiceClient } from "@azure/storage-blob";


app.http('uibeListBlobs', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AzureWebJobsStorage);
        const containerName = 'cust-doc';
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        context.log("File Listsing in container!");

        let i = 1;
        let blobList = [];
        const blobs = containerClient.listBlobsFlat();
        for await (const blob of blobs) {
                context.log(`Blob ${i++}: ${blob.name}`);
                blobList.push({"name": blob.name, "length": blob.properties.contentLengthm, "contentType": blob.properties.contentType, "createdOn": blob.properties.createdOn, "lastModified": blob.properties.lastModified });
        }
        return { status: 200, jsonBody: { ok: true,  fileList: blobList }};
    }
});