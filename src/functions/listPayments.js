import { app } from "@azure/functions"

app.http('listPayments', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http method:  ${request.method}`);
        context.log(`Http url: ${request.url}`);
        try {
            const pdate = request.query.get('pdate'); // Тут запитуємо дату операційного дня
            context.log(`Query parameter pdate: ${pdate}`);
            if (!pdate){
                throw new Error('Query parameter pdate is required');
            }
            const plist=[
                        {"pnum": "23", "pdate": "2025-06-01", "value_date": "2025-06-05", "dacc": "222100001", "kacc": "333300002", "amount": 10.23, "currency": "UAH", "payment_type": "TRNSFER", "description": "Test 0 payment"},
                        {"pnum": "01", "pdate": "2025-06-21", "value_date": "2025-06-21", "dacc": "222100001", "kacc": "333300003", "amount": 13.13, "currency": "EUR", "payment_type": "TRNSFER", "description": "Test 1 payment"},
                        {"pnum": "02", "pdate": "2025-06-21", "value_date": "2025-06-21", "dacc": "222100001", "kacc": "333300004", "amount": 12.10, "currency": "EUR", "payment_type": "TRNSFER", "description": "Test 2 payment"},
                        {"pnum": "02", "pdate": "2025-06-21", "value_date": "2025-06-21", "dacc": "222100001", "kacc": "333300005", "amount": 37.65, "currency": "EUR", "payment_type": "TRNSFER", "description": "Test 3 payment"}
            ];
            return { status: 200, jsonBody: { paymentList: plist  }};
        }
         catch (error) {
            context.error(`Error occured: ${error.message}`);
            return { status: 422, jsonBody: { ok: false, message: error.message }};
        }
        

    }
});
