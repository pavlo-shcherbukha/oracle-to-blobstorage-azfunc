import { app } from "@azure/functions";

app.http("httpTrigger", {
    methods: ["GET", "POST"],
    authLevel: "anonymous", // Для простоти тестування
    handler: async (request, context) => {
        context.log("HTTP function triggered successfully!");
        return { 
            status: 200, 
            body: "Hello from Azure Functions (Node.js V4)!" 
        };
    }
});