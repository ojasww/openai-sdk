import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testAPI() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: "Hello, how are you?" }],
        });
        console.log(response);
    } catch (error) {
        console.error("Error:", error);
    }
}

testAPI();
