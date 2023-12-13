// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Voice-Activated Recipe Finder installed.");
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "fetchRecipes") {
        try {
            const recipeTitles = await fetchRecipes(message.ingredients);
            sendResponse({ status: "success", recipes: recipeTitles });
        } catch (error) {
            console.error("Error fetching recipes:", error);
            sendResponse({ status: "error", message: error.message });
        }
    }
    return true; // keep the message channel open for sendResponse
});


