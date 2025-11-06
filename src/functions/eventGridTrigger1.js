import { app, output }  from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import "@azure/functions-extensions-blob";
import { DefaultAzureCredential }  from '@azure/identity';
import { URL }  from 'url';

const credential = new DefaultAzureCredential();
const queueOutput = output.storageQueue({
    queueName: 'blob-processing-queue',
    connection: 'AzureWebJobsStorage'
});

app.eventGrid('eventGridTrigger1', {
    extraOutputs: [queueOutput],
    handler:  async (event, context) => {
        context.log('Event grid function processed event:', event);
        context.log('--- Function eventGridTrigger1 (V4) is trigered by Event Grid ---');
         
        // Check is eventType is BlobCreated
        if ( event.eventType !== 'Microsoft.Storage.BlobCreated' ){
            context.log(`Skip Event Type: ${event.eventType}`);
            return;
        }

        // Read inforamtion about the created blob and parse it
        const eventData = event.data;

        const blobUrl = eventData.url;
        context.log(`URL-addres of the new Blob: ${blobUrl}`);
        context.log(`Content type: ${eventData.contentType}`);
        context.log(`Length (bytes): ${eventData.contentLength}`);

        // 1. Parse URL-address
        const url = new URL(blobUrl);
        const pathParts = url.pathname.split('/').filter(p => p);

        if (pathParts.length < 2) {
            context.error("Wrong  blob path.");
            return;
        }

        // separate  blob container name and blob name
        const containerName = pathParts[0];
        const blobName = pathParts.slice(1).join('/');
        const storageAccountUrl = url.origin;

        context.log(`Container name: ${containerName}`);
        context.log(`Blob name: ${blobName}`);


        // 2. Connect to Azure Storage using Azure Identity and get custom blob metadata via 
        // Azure Storage Blob SDK
        try {
            // 2.1. Create BlobService Client
            const blobServiceClient = new BlobServiceClient(storageAccountUrl, credential);
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobClient = containerClient.getBlobClient(blobName);

            // 2.2. Get Blob properties
            const properties = await blobClient.getProperties();
            context.log('--- Get Blob properties (via SDK) ---');
            context.log(`Custom metadata: ${JSON.stringify(properties.metadata)}`);
            context.log(`ETag: ${properties.etag}`);
            
            // 3. Create message for Storage Queue
            const queueData = {
                blobName: blobName,
                containerName: containerName,
                contentType: eventData.contentType,
                blobSize: eventData.contentLength, 
                blobUrl: blobUrl,
                customMetadata: properties.metadata || {}
            };
            //4. Publish message to Storage Queue
            context.extraOutputs.set( queueOutput, queueData);
            context.log(`Message sent to blob-processing-queue: ${JSON.stringify(queueData)}`);
            
        } catch (error) {
            context.error('Error Access  Azure Storage via SDK:', error);
              throw error; 
        }

        context.log('--- Finaly ENDUP ---');

        
    }
});
