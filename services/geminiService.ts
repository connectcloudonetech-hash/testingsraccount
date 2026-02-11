
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const analyzeFinances = async (transactions: Transaction[], prompt: string): Promise<string> => {
  // Initialize GoogleGenAI with the API key from environment variables
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = `
    You are a professional financial advisor AI. 
    Here is the current transaction history of the user:
    ${JSON.stringify(transactions, null, 2)}
    
    User Query: ${prompt}
    
    Analyze the data and provide a concise, insightful response. 
    Point out trends, suggest savings, or summarize the financial health.
    Format your response using Markdown.
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning tasks involving financial data analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: context,
    });
    // Use .text property directly, not as a function
    return response.text || "I couldn't analyze the data at this time.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Error communicating with the AI. Please ensure your API key is valid.";
  }
};

export const suggestCategory = async (description: string, categories: string[]): Promise<string> => {
  // Initialize GoogleGenAI right before the call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Given the transaction description: "${description}"
    Categorize it into EXACTLY ONE of the following categories: ${categories.join(', ')}
    Return ONLY the category name and nothing else.
  `;

  try {
    // Using gemini-3-flash-preview for simple text classification tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Use .text property directly
    const suggested = response.text?.trim() || 'Other';
    // Validate that the suggestion is in our list, otherwise default to 'Other'
    return categories.includes(suggested) ? suggested : 'Other';
  } catch (error) {
    console.error("Gemini categorization error:", error);
    return 'Other';
  }
};