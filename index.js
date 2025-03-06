import "dotenv/config";
import OpenAI from "openai";

console.log("Hello!")
console.log("Env: ", process.env.OPENAI_API_KEY)

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

async function getLocation() {
    const response = await fetch("https://ipapi.co/json/");
    const locationData = await response.json();
    return locationData;
}

async function getCurrentWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=apparent_temperature`;
    const response = await fetch(url);
    const weatherData = await response.json();
    return weatherData;
}

const tools = [
    {
        type: "function",
        function: {
            name: "getCurrentWeather",
            description: "Get the current weather in a given location",
            parameters: {
                type: "object",
                properties: {
                    latitude: {
                        type: "string",
                    },
                    longitude: {
                        type: "string",
                    },
                },
                required: ["longitude", "latitude"],
            },
        }
    },
    {
        type: "function",
        function: {
            name: "getLocation",
            description: "Get the user's location based on their IP address",
            parameters: {
                type: "object",
                properties: {},
            },
        }
    },
];

const messages = [
    {
        role: "system",
        content:
            "You are a helpful assistant. Only use the functions you have been provided with.",
    },
];

async function agent(userInput) {
    messages.push({
        role: "user",
        content: userInput,
    });
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        tools: tools,
    });
    console.log(response);
}

console.log(agent("Where am I located right now?"))