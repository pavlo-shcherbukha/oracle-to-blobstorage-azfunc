//const { app } = require('@azure/functions');
import "@azure/functions-extensions-blob";
import { app, output } from "@azure/functions"; // Додано 'output'
import { BlobServiceClient } from "@azure/storage-blob";

const queueOutput = output.storageQueue({
    queueName: 'blob-processing-queue',
    connection: 'AzureWebJobsStorage',
});

app.storageBlob('storageBlobNotify', {
    path: 'cust-docs',
    connection: '673061_STORAGE',
    handler: (blob, context) => {  
        context.log(`Storage blob function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`);
    }
});
