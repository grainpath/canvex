/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// ✅ Puter.js is loaded globally via index.html — no import needed
// No API key required!
declare const puter: any;

// Helper: convert File to base64 data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

/**
 * Generates an edited image using Puter.js AI based on a text prompt and a specific point.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @param hotspot The {x, y} coordinates on the image to focus the edit.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    hotspot: { x: number, y: number }
): Promise<string> => {
    console.log('Starting generative edit at:', hotspot);

    const dataUrl = await fileToDataUrl(originalImage);

    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on the user's request.
User Request: "${userPrompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding area.
- The rest of the image (outside the immediate edit area) must remain identical to the original.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity. Do not perform these edits.

Output: Return ONLY the final edited image. Do not return text.`;

    console.log('Sending image and prompt to Puter.js...');

    const imgElement = await puter.ai.txt2img(prompt, {
        model: 'gpt-image-1.5',
        image: dataUrl,
    });

    console.log('Received response from Puter.js for edit.');

    // Extract src from returned image element
    const src = imgElement?.src;
    if (!src) throw new Error('Failed to generate the image. Puter.js did not return an image.');
    return src;
};

/**
 * Generates an image with a filter applied using Puter.js AI.
 * @param originalImage The original image file.
 * @param filterPrompt The text prompt describing the desired filter.
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export const generateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);

    const dataUrl = await fileToDataUrl(originalImage);

    const prompt = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
Filter Request: "${filterPrompt}"

Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- You MUST REFUSE any request that explicitly asks to change a person's race.

Output: Return ONLY the final filtered image. Do not return text.`;

    console.log('Sending image and filter prompt to Puter.js...');

    const imgElement = await puter.ai.txt2img(prompt, {
        model: 'gpt-image-1.5',
        image: dataUrl,
    });

    console.log('Received response from Puter.js for filter.');

    const src = imgElement?.src;
    if (!src) throw new Error('Failed to generate the image. Puter.js did not return an image.');
    return src;
};

/**
 * Generates an image with a global adjustment applied using Puter.js AI.
 * @param originalImage The original image file.
 * @param adjustmentPrompt The text prompt describing the desired adjustment.
 * @returns A promise that resolves to the data URL of the adjusted image.
 */
export const generateAdjustedImage = async (
    originalImage: File,
    adjustmentPrompt: string,
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);

    const dataUrl = await fileToDataUrl(originalImage);

    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire image based on the user's request.
User Request: "${adjustmentPrompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity.

Output: Return ONLY the final adjusted image. Do not return text.`;

    console.log('Sending image and adjustment prompt to Puter.js...');

    const imgElement = await puter.ai.txt2img(prompt, {
        model: 'gpt-image-1.5',
        image: dataUrl,
    });

    console.log('Received response from Puter.js for adjustment.');

    const src = imgElement?.src;
    if (!src) throw new Error('Failed to generate the image. Puter.js did not return an image.');
    return src;
};
