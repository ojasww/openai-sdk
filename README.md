# How to Build an Agent with the Node.js SDK

OpenAI functions enable your app to take action based on user inputs. This means that it can, e.g., search the web, send emails, or book tickets on behalf of your users, making it more powerful than a regular chatbot.

In this tutorial, you will build an app that uses OpenAI functions along with the latest version of the Node.js SDK. The app runs in the browser, so you only need a code editor and, e.g., VS Code Live Server to follow along locally. Alternatively, write your code directly in the browser via [this code playground at Scrimba.](https://scrimba.com/scrim/c6r3LkU9)

## What You Will Build

Our app is a simple agent that helps you find activities in your area. It has access to two functions, `getLocation()` and `getCurrentWeather()`, which means it can figure out where you’re located and what the weather is at the moment.

At this point, it's important to understand that OpenAI doesn't execute any code for you. It just tells your app which functions it should use in a given scenario, and then leaves it up to your app to invoke them.

Once our agent knows your location and the weather, it'll use GPT’s internal knowledge to suggest suitable local activities for you.

## Importing the SDK and Authenticating with OpenAI

We start by importing the OpenAI SDK at the top of our JavaScript file and authenticate with our API key, which we have stored as an environment variable.

```js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});
```

## Creating Our Two Functions

Next, we'll create the two functions. The first one - `getLocation` - uses the [IP API](https://ipapi.co/) to get the location of the user.

```js
async function getLocation() {
  const response = await fetch("https://ipapi.co/json/");
  const locationData = await response.json();
  return locationData;
}
```

The second function, `getCurrentWeather`, uses the [Open Meteo API](https://open-meteo.com/) to get the current weather data.

```js
async function getCurrentWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=apparent_temperature`;
  const response = await fetch(url);
  const weatherData = await response.json();
  return weatherData;
}
```

## Describing Our Functions for OpenAI

For OpenAI to understand the purpose of these functions, we need to describe them using a specific schema.

```js
const tools = [
  {
    type: "function",
    function: {
      name: "getCurrentWeather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          latitude: { type: "string" },
          longitude: { type: "string" },
        },
        required: ["longitude", "latitude"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getLocation",
      description: "Get the user's location based on their IP address",
      parameters: { type: "object", properties: {} },
    },
  },
];
```

## Setting Up the Messages Array

We define a `messages` array to keep track of the conversation history.

```js
const messages = [
  {
    role: "system",
    content: "You are a helpful assistant. Only use the functions you have been provided with.",
  },
];
```

## Creating the Agent Function

The `agent` function processes user input, invokes OpenAI's model, and handles function calls dynamically.

```js
async function agent(userInput) {
  messages.push({ role: "user", content: userInput });

  for (let i = 0; i < 5; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      tools: tools,
    });

    const { finish_reason, message } = response.choices[0];

    if (finish_reason === "tool_calls" && message.tool_calls) {
      const functionName = message.tool_calls[0].function.name;
      const functionToCall = availableTools[functionName];
      const functionArgs = JSON.parse(message.tool_calls[0].function.arguments);
      const functionArgsArr = Object.values(functionArgs);
      const functionResponse = await functionToCall.apply(null, functionArgsArr);

      messages.push({
        role: "function",
        name: functionName,
        content: `The result of the last function was this: ${JSON.stringify(functionResponse)}`,
      });
    } else if (finish_reason === "stop") {
      messages.push(message);
      return message.content;
    }
  }
  return "The maximum number of iterations has been met without a suitable answer. Please try again with a more specific input.";
}
```

## Running the Final App

You can now test your agent by running:

```js
const response = await agent(
  "Please suggest some activities based on my location and the current weather."
);
console.log("response:", response);
```

You've now built an AI agent using OpenAI functions and the Node.js SDK! Consider enhancing this app by adding a function that fetches up-to-date information on events and activities in the user's location.

Happy coding!

