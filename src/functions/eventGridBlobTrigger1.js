const { app } = require('@azure/functions');

app.storageBlob('eventGridBlobTrigger1', {
    path: 'cust-doc',
    source: 'EventGrid',
    connection: 'AzureWebJobsStorage',
    handler: (blob, context) => {
        context.log(`Storage blob function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`);
    }
});
