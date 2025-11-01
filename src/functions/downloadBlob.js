
import { app } from "@azure/functions"
import { BlobServiceClient } from "@azure/storage-blob";
import "@azure/functions-extensions-blob";


app.http('downloadBlob', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const fileName = request.query.get('file');
        if (!fileName) {
            return { status: 400, jsonBody: { ok: false, message: 'No file specified' }};
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AzureWebJobsStorage);
        const containerName = 'cust-doc';
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        const downloadBlockBlobResponse = await blockBlobClient.download();
        const downloaded = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

        return {
            status: 200,
            body: downloaded,
            headers: { 'Content-Type': 'application/octet-stream' }
        };
    }
});

// Допоміжна функція для читання потоку у Buffer
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}