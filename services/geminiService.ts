/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// ✅ Sleep helper for retry delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ✅ Retry wrapper — auto retries on 429 quota errors
const callWithRetry = async (fn: () => Promise<any>, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const is429 = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
            if (is429 && i < retries - 1) {
                console.log(`Rate limit hit. Waiting 15 seconds before retry ${i + 1}...`);
                await sleep(15000);
            } else if (is429) {
                throw new Error('Daily limit reached (500/day). Please wait a few minutes and try again.');
            } else {
                throw error;
            }
        }
    }
};

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

const handleApiResponse = (
    response: GenerateContentResponse,
    context: string
): string => {
    // 1. Check for prompt blocking first
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    // 2. Try to find the image part
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        console.log(`Received image data (${mimeType}) for ${context}`);
        return `data:${mimeType};base64,${data}`;
    }

    // 3. If no image, check finish reason
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image for the ${context}. ` + 
        (textFeedback 
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt.");

    console.error(`Model response did not contain an image part for ${context}.`, { response });
    throw new Error(errorMessage);
};

/**
 * Generates an edited image using Gemini 2.5 Flash Image Preview.
 */
export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    hotspot: { x: number, y: number }
): Promise<string> => {
    console.log('Starting generative edit at:', hotspot);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on the user's request.
User Request: "${userPrompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding area.
- The rest of the image (outside the immediate edit area) must remain IDENTICAL to the original.
- Preserve ALL colors, lighting, style, and composition of the original image.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity.

Output: Return ONLY the final edited image. Do not return text.`;

    const response: GenerateContentResponse = await callWithRetry(() =>
        ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview', // ✅ correct exact model string
            contents: { parts: [originalImagePart, { text: prompt }] },
            config: { temperature: 0 }, // ✅ consistent results
        })
    );

    return handleApiResponse(response, 'edit');
};

/**
 * Generates an image with a filter applied using Gemini 2.5 Flash Image Preview.
 */
export const generateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
Filter Request: "${filterPrompt}"

Editing Guidelines:
- Preserve ALL composition, subjects, and structure of the original image.
- Only change the color grading and visual style.

Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- You MUST REFUSE any request that explicitly asks to change a person's race.

Output: Return ONLY the final filtered image. Do not return text.`;

    const response: GenerateContentResponse = await callWithRetry(() =>
        ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview', // ✅ correct exact model string
            contents: { parts: [originalImagePart, { text: prompt }] },
            config: { temperature: 0 }, // ✅ consistent results
        })
    );

    return handleApiResponse(response, 'filter');
};

/**
 * Generates an image with a global adjustment applied using Gemini 2.5 Flash Image Preview.
 */
export const generateAdjustedImage = async (
    originalImage: File,
    adjustmentPrompt: string,
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire image based on the user's request.
User Request: "${adjustmentPrompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic.
- Preserve ALL original subjects, composition, and structure.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity.

Output: Return ONLY the final adjusted image. Do not return text.`;

    const response: GenerateContentResponse = await callWithRetry(() =>
        ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview', // ✅ correct exact model string
            contents: { parts: [originalImagePart, { text: prompt }] },
            config: { temperature: 0 }, // ✅ consistent results
        })
    );

    return handleApiResponse(response, 'adjustment');
};
