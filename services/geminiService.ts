
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseInvoiceInput = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following Bangladeshi business order input into a structured JSON format: "${input}". 
      Extract name, phone, items (name, size, quantity, price), deliveryType (Inside Dhaka or Outside Dhaka), and advancePayment.
      If a field is not found, leave it empty or null. Try to infer BDT prices if possible.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customerName: { type: Type.STRING },
            customerPhone: { type: Type.STRING },
            customerAddress: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  size: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER }
                }
              }
            },
            deliveryType: { type: Type.STRING, description: "Must be 'Inside Dhaka' or 'Outside Dhaka'" },
            advancePayment: { type: Type.NUMBER }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return null;
  }
};

export const detectLocationFromAddress = async (address: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this Bangladeshi address: "${address}", determine the District and whether it's "Inside Dhaka" or "Outside Dhaka". Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            district: { type: Type.STRING },
            deliveryType: { type: Type.STRING, description: "'Inside Dhaka' or 'Outside Dhaka'" }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};

export const generateThankYouMessage = async (customerName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a polite, professional, and friendly Bangladeshi thank you message in Bengali for a customer named ${customerName} who just placed an order. Keep it short and heart-touching.`,
    });
    return response.text;
  } catch (error) {
    return "আপনার অর্ডারের জন্য অসংখ্য ধন্যবাদ!";
  }
};

export const validateInvoiceAI = async (invoiceData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Review this invoice data and check for issues common in Bangladesh (invalid phone format, missing delivery type, suspicious pricing, or negative balance). 
      Data: ${JSON.stringify(invoiceData)}
      Provide a list of warnings if any, or an empty list if it looks good.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text).warnings;
  } catch (error) {
    return [];
  }
};
