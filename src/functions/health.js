import { app } from "@azure/functions";

app.http("httpTrigger", {
    methods: ["GET"],
    authLevel: "anonymous", 
    handler: async (request, context) => {
        context.log("HTTP function health  triggered successfully!");
        return { 
            status: 200, 
            body: {
                "ok": true,
                "message": "Azure Functions (Node.js V4) is working!"
            } 
        };
    }
});