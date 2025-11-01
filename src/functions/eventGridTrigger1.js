const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const { URL } = require('url');

// Використовуйте Managed Identity (DefaultAzureCredential)
const credential = new DefaultAzureCredential();
const queueOutput = output.storageQueue({
    queueName: 'blob-processing-queue',
    connection: 'AzureWebJobsStorage'
});

app.eventGrid('eventGridTrigger1', {
    extraOutputs: [queueOutput],
    handler:  async (event, context) => {
        context.log('Event grid function processed event:', event);
        context.log('--- Функція eventGridTrigger1 (V4) викликана Event Grid ---');
         
        // Перевірка типу події  eventType
        //if (event.type !== "Microsoft.Storage.BlobCreated") {
        if ( event.eventType !== 'Microsoft.Storage.BlobCreated' ){

            //context.log(`Пропущено подію типу: ${event.type}`);
            context.log(`Пропущено подію типу: ${event.eventType}`);
            return;
        }

        // Об'єкт 'data' містить метадані blob
        const eventData = event.data;

        const blobUrl = eventData.url;
        context.log(`URL-адреса нового Blob: ${blobUrl}`);
        context.log(`Тип вмісту: ${eventData.contentType}`);
        context.log(`Розмір (байти): ${eventData.contentLength}`);

        // 1. Аналіз URL-адреси
        const url = new URL(blobUrl);
        const pathParts = url.pathname.split('/').filter(p => p);

        if (pathParts.length < 2) {
            context.error("Недійсний шлях blob.");
            return;
        }

        const containerName = pathParts[0];
        const blobName = pathParts.slice(1).join('/');
        const storageAccountUrl = url.origin;

        context.log(`Ім'я контейнера: ${containerName}`);
        context.log(`Ім'я Blob: ${blobName}`);


        // 2. Підключення до сховища та читання метаданих
        try {
            const blobServiceClient = new BlobServiceClient(storageAccountUrl, credential);
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobClient = containerClient.getBlobClient(blobName);

            // Отримання властивостей (включаючи кастомні метадані)
            const properties = await blobClient.getProperties();
            context.log('--- Додаткові властивості Blob (через SDK) ---');
            context.log(`Кастомні метадани: ${JSON.stringify(properties.metadata)}`);
            context.log(`ETag: ${properties.etag}`);

            const queueData = {
                blobName: blobName,
                containerName: containerName,
                contentType: blobProperties.contentType,
                blobSize: eventData.contentLength, 
                blobUrl: blobUrl
            };

            context.extraOutputs.set( queueOutput, queueData);
            context.log(`Message sent to blob-processing-queue: ${JSON.stringify(queueData)}`);

        } catch (error) {
            context.error('Помилка під час доступу до Azure Storage за допомогою SDK:', error);
            // У V4 помилки викидаються, щоб хост їх зафіксував
            throw error; 
        }

        context.log('--- Функція завершила виконання ---');

        
    }
});
