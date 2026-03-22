// index.mjs
import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

const dbClient = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const { httpMethod, body, pathParameters } = event;

  if (httpMethod === "POST") {
    const item = JSON.parse(body);
    const { itemId, itemName, itemPrice } = item;

    if (
      itemId === undefined ||
      itemName === undefined ||
      itemPrice === undefined
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required fields: itemId, itemName, itemPrice",
        }),
      };
    }

    const command = new PutItemCommand({
      TableName: "smartShoppingCart_items",
      Item: {
        itemId: { N: itemId.toString() }, // 🟢 numeric key passed as string
        itemName: { S: itemName },
        itemPrice: { N: itemPrice.toString() },
      },
    });

    try {
      await dbClient.send(command);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Item added successfully" }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  if (httpMethod === "DELETE") {
    const { itemId } = pathParameters || {};

    if (itemId === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing 'itemId' in path" }),
      };
    }

    const command = new DeleteItemCommand({
      TableName: "smartShoppingCart_items",
      Key: {
        itemId: { N: itemId.toString() }, // 🟢 still passed as string
      },
    });

    try {
      await dbClient.send(command);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Item deleted successfully" }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({
      message: `Method ${httpMethod} not allowed`,
      allowedMethods: ["POST", "DELETE"],
    }),
  };
};
