const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const baseUrl = process.env.FAPSHI_BASE_URL || "https://live.fapshi.com";

// Function to get Fapshi credentials from database
async function getFapshiCredentials(
    serviceType = "COLLECTION",
    environment = "PRODUCTION"
) {
    try {
        const config = await prisma.fapshiConfig.findUnique({
            where: {
                serviceType_environment: {
                    serviceType,
                    environment,
                },
            },
        });

        if (!config || !config.isActive) {
            throw new Error(
                `Fapshi ${serviceType} configuration not found or inactive`
            );
        }

        return {
            apiuser: config.apiUser,
            apikey: config.apiKey,
        };
    } catch (error) {
        console.error("Error getting Fapshi credentials:", error);
        throw error;
    }
}

module.exports = {
    /** 
      *This function returns an object with the link were a user is to be redirected in order to complete his payment

      *Below is a parameter template. Just amount is required

          data = {
              "amount": Integer ,
              "email": String,
              "userId": String,
              "externalId": String,
              "redirectUrl": String,
              "message": String
          }
      */

    /** 
      *This function directly initiates a payment request to a user's mobile device and 
      returns an object with a transId property that is used to get the status of the payment

      *Below is a parameter template. amount and phone are required

          data = {
              "amount": Integer ,
              "phone": String ,
              "medium": String,
              "name": String,
              "email": String,
              "userId": String,
              "externalId": String,
              "message": String
          }
      */
    async directPay(data) {
        return new Promise(async function(resolve) {
            try {
                if (!data || !data.amount) resolve(error("amount required", 400));
                if (!Number.isInteger(data.amount))
                    resolve(error("amount must be of type integer", 400));
                if (data.amount < 100)
                    resolve(error("amount cannot be less than 100 XAF", 400));
                if (!data || !data.phone) resolve(error("phone number required", 400));
                if (typeof data.phone !== "string")
                    resolve(error("phone must be of type string", 400));
                if (!/^6[\d]{8}$/.test(data.phone))
                    resolve(error("invalid phone number", 400));

                // Get credentials from database
                const credentials = await getFapshiCredentials(
                    "COLLECTION",
                    "PRODUCTION"
                );

                const config = {
                    method: "post",
                    url: baseUrl + "/direct-pay",
                    headers: credentials,
                    data: data,
                };
                const response = await axios(config);
                response.data.statusCode = response.status;
                resolve(response.data);
            } catch (e) {
                if (e.response && e.response.data) {
                    e.response.data.statusCode = e.response.status;
                    resolve(e.response.data);
                } else {
                    resolve(error("Network error", 500));
                }
            }
        });
    },

    /**
     * This function returns an object containing the details of the transaction associated with the Id passed as parameter
     */
    async paymentStatus(transId) {
        return new Promise(async function(resolve) {
            try {
                if (!transId || typeof transId !== "string")
                    resolve(error("invalid type, string expected", 400));
                if (!/^[a-zA-Z0-9]{8,10}$/.test(transId))
                    resolve(error("invalid transaction id", 400));

                // Get credentials from database
                const credentials = await getFapshiCredentials(
                    "COLLECTION",
                    "PRODUCTION"
                );

                const config = {
                    method: "get",
                    url: baseUrl + "/payment-status/" + transId,
                    headers: credentials,
                };
                const response = await axios(config);
                response.data.statusCode = response.status;
                resolve(response.data);
            } catch (e) {
                if (e.response && e.response.data) {
                    e.response.data.statusCode = e.response.status;
                    resolve(e.response.data);
                } else {
                    resolve(error("Network error", 500));
                }
            }
        });
    },

    /**
     * This function expires the transaction associated with the Id passed as parameter and returns an object containing the details of the transaction
     */
    async expirePay(transId) {
        return new Promise(async function(resolve) {
            try {
                if (!transId || typeof transId !== "string")
                    resolve(error("invalid type, string expected", 400));
                if (!/^[a-zA-Z0-9]{8,10}$/.test(transId))
                    resolve(error("invalid transaction id", 400));

                // Get credentials from database
                const credentials = await getFapshiCredentials(
                    "COLLECTION",
                    "PRODUCTION"
                );

                const config = {
                    method: "post",
                    url: baseUrl + "/expire-pay",
                    data: { transId },
                    headers: credentials,
                };
                const response = await axios(config);
                response.data.statusCode = response.status;
                resolve(response.data);
            } catch (e) {
                if (e.response && e.response.data) {
                    e.response.data.statusCode = e.response.status;
                    resolve(e.response.data);
                } else {
                    resolve(error("Network error", 500));
                }
            }
        });
    },

    /**
     * This function returns an array of objects containing the transaction details of the user Id passed as parameter
     */
    async userTrans(userId) {
        return new Promise(async function(resolve) {
            try {
                if (!userId || typeof userId !== "string")
                    resolve(error("invalid type, string expected", 400));
                if (!/^[a-zA-Z0-9-_]{1,100}$/.test(userId))
                    resolve(error("invalid user id", 400));

                // Get credentials from database
                const credentials = await getFapshiCredentials(
                    "COLLECTION",
                    "PRODUCTION"
                );

                const config = {
                    method: "get",
                    url: baseUrl + "/transaction/" + userId,
                    headers: credentials,
                };
                const response = await axios(config);
                resolve(response.data);
            } catch (e) {
                if (e.response && e.response.data) {
                    e.response.data.statusCode = e.response.status;
                    resolve(e.response.data);
                } else {
                    resolve(error("Network error", 500));
                }
            }
        });
    },

    /**
     * This function returns an object containing the balance of a service
     */
    async balance() {
        return new Promise(async function(resolve) {
            try {
                // Get credentials from database
                const credentials = await getFapshiCredentials(
                    "COLLECTION",
                    "PRODUCTION"
                );

                const config = {
                    method: "get",
                    url: baseUrl + "/balance",
                    headers: credentials,
                };
                const response = await axios(config);
                response.data.statusCode = response.status;
                resolve(response.data);
            } catch (e) {
                if (e.response && e.response.data) {
                    e.response.data.statusCode = e.response.status;
                    resolve(e.response.data);
                } else {
                    resolve(error("Network error", 500));
                }
            }
        });
    },

    /** 
      *This function performs a payout to the phone number specified in the data parameter and 
      returns an object with a transId property that is used to get the status of the payment
      
      *Note: In the live environment, payouts must be enabled for this to work. Contact support if needed

      *Below is a parameter template. amount and phone are required

          data = {
              "amount": Integer ,
              "phone": String ,
              "medium": String,
              "name": String,
              "email": String,
              "userId": String,
              "externalId": String,
              "message": String
          }
      */
    async payout(data) {
        return new Promise(async function(resolve) {
            try {
                if (!data || !data.amount)
                    return resolve(error("amount required", 400));
                if (!Number.isInteger(data.amount))
                    return resolve(error("amount must be of type integer", 400));
                if (data.amount < 100)
                    return resolve(error("amount cannot be less than 100 XAF", 400));
                if (!data || !data.phone)
                    return resolve(error("phone number required", 400));
                if (typeof data.phone !== "string")
                    return resolve(error("phone must be of type string", 400));
                if (!/^6[\d]{8}$/.test(data.phone))
                    return resolve(error("invalid phone number", 400));

                // Get credentials from database
                const credentials = await getFapshiCredentials(
                    "DISBURSEMENT",
                    "PRODUCTION"
                );

                const config = {
                    method: "post",
                    url: baseUrl + "/payout",
                    headers: credentials,
                    data: data,
                };
                const response = await axios(config);
                response.data.statusCode = response.status;
                resolve(response.data);
            } catch (e) {
                if (e.response && e.response.data) {
                    e.response.data.statusCode = e.response.status;
                    resolve(e.response.data);
                } else {
                    resolve(error("Network error", 500));
                }
            }
        });
    },

    /** 
      *This function returns an array containing the transactions that satisfy
      the criteria specifed in the parameter passed to the function

      *Below is a parameter template.

          params = {
              "status": enum [created, successful, failed, expired],
              "medium": mobile money or orange money,
              "start": Date in format yyyy-mm-dd,
              "end": Date in format yyyy-mm-dd,
              "amt": >= 100,
              "limit": range(1, 100) default is 10,
              "sort": asc || desc
          }
      */
    async search(params = {}) {
        return new Promise(async function(resolve) {
            try {
                // Get credentials from database
                const credentials = await getFapshiCredentials(
                    "COLLECTION",
                    "PRODUCTION"
                );

                const config = {
                    method: "get",
                    url: baseUrl + "/search",
                    params: params,
                    headers: credentials,
                };
                const response = await axios(config);
                resolve(response.data);
            } catch (e) {
                if (e.response && e.response.data) {
                    e.response.data.statusCode = e.response.status;
                    resolve(e.response.data);
                } else {
                    resolve(error("Network error", 500));
                }
            }
        });
    },
};

function error(message, statusCode) {
    return { message, statusCode };
}