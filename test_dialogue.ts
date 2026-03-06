import dotenv from "dotenv";
dotenv.config();

// Delay import until after dotenv
async function test() {
    const { generateDialogue } = await import("./src/ai");
    try {
        console.log("Testing 5-turn dialogue generation...");
        const dialogue = await generateDialogue("grab a coffee", "making plans with a friend");
        console.log("SUCCESS:", JSON.stringify(dialogue, null, 2));
    } catch (err) {
        console.error("FAILED:", err);
    }
}
test();
