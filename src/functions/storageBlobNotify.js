//const { app } = require('@azure/functions');
import "@azure/functions-extensions-blob";
import { app, output } from "@azure/functions"; // Додано 'output'
import { BlobServiceClient } from "@azure/storage-blob";

const queueOutput = output.storageQueue({
    queueName: 'blob-processing-queue',
    connection: 'AzureWebJobsStorage'
});

/*
app.storageBlob('storageBlobNotify', {
    path: 'cust-docs',
    connection: '673061_STORAGE',
    handler: (blob, context) => {  
        context.log(`Storage blob function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`);
    }
});
*/

app.storageBlob("storageBlobNotify", {
    path: `${process.env["containerName"]}/{name}`, 
    connection: 'AzureWebJobsStorage',
    extraOutputs: [queueOutput],
    handler: async (blob, context) => {
        context.log(`Blob trigger processing: ${context.triggerMetadata.name}  with size ${blob.length} bytes`);
        const connectionString = process.env["AzureWebJobsStorage"];
        const containerName = process.env["containerName"]; //cust-docs
        const blobName = context.triggerMetadata.name;
        if (!connectionString) {
            context.error("673061_STORAGE connection string is not set.");
            return;
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobName);
        try {
            const blobProperties = await blobClient.getProperties();
            context.log(`Blob size: ${blobProperties.contentLength}`);
            context.log(`Blob content type: ${blobProperties.contentType}`);
            const queueData = {
                blobName: blobName,
                containerName: containerName,
                blobSize: blobProperties.contentLength,
                contentType: blobProperties.contentType,
                uploadedAt: new Date().toISOString(),
                blobUrl: blobClient.url
            };

            context.extraOutputs.set( queueOutput, queueData);
            context.log(`Message sent to blob-processing-queue: ${JSON.stringify(queueData)}`);

            
        } catch (error) {
            context.error(`Error processing blob or sending message: ${error.message}`);
        }

      
    }
});
