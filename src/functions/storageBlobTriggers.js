const { app } = require('@azure/functions');

app.storageBlob('storageBlobTriggers', {
    path: 'cust-doc/{name}',
    connection: 'AzureWebJobsStorage',
    handler: (blob, context) => {
        context.log(`Storage blob function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`);
    }
});
