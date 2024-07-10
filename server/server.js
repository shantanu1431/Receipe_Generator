const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/recipeStream", (req, res) => {

    const ingredients = req.query.ingredients;
    const mealType = req.query.mealType;
    const cuisine = req.query.cuisine;
    const cooingTime = req.query.cookingTime;
    const complexity = req.query.complexity;

    console.log(req.query)

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");


    const sendEvent = (chunk) => {

        let chunkResponse;
        if (chunkResponse.choices[0].finish_reason === "stop") {
            res.write(`data: ${JSON.stringyfy({ action: "close" })}\n\n`);
        }
        else {
            if (
                chunk.choices[0].delta.role &&
                chunk.choices[0].delta.role === "assistant"
            ) {
                chunkResponse = {
                    action: "start",
                };
            } else {
                chunkResponse = {
                    action: "chunk",
                    chunk: chunk.choices[0].delta.content,
                };
            }
            res.write(`data: ${JSON.stringyfy(chunkResponse)}\n\n`);
        }
    };


    const prompt = [];
    prompt.push("Generate a recipe that incorporates the following details:");
    prompt.push(`[Ingredients: ${ingredients}]`);
    prompt.push(`[Meal type: ${mealType}]`);
    prompt.push(`[Cuisine preference: ${cuisine}]`);
    prompt.push(`[Cooking Time: ${cookingTime}]`);
    prompt.push(`[Complexity: ${complexity}]`);


    prompt.push(
        "please provide a detailed recipe, including steps for preparation and cooking. only use the ingredients provided."
    );

    prompt.push("The recipe should highlight the fresh and vibrant flavours of the ingredients.");

    prompt.push("Also give the recipe a suitable name in its local language based on cuisine preference.");


    const messages = [
        {
            role: "system",
            content: prompt.join(" "),
        },
    ];

    fetchOpenAICompletionsStream(messages, sendEvent);

    req.on("close", () => {
        res.end();
    });
});

async function fetchOpenAICompletionsStream(messages, callback) {

   
    const OPENAI_API_KEY = "create your own OPENAI api key";
    const openai = new OpenAI({ apikey: OPENAI_API_KEY });
    const aiModel = "gpt-4-1106-preview";

    try {
        openai.chat.completion.create({
            model: aiModel,
            messages: messages,
            stream: true,
        })

        for await (const chunk of completion) {
            callback(chunk);
        }
    } catch (error) {
        console.error("Error fetching data from OpenAI API:", error);
        throw new Error("Error fetching data from OpenAI API.");
    }
}


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
