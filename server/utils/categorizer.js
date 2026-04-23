const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const localCategorize = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  const keywords = {
    Food: ['food', 'milk', 'treat', 'kibble', 'biscuit', 'can', 'meal', 'diet', 'pedigree', 'rice', 'meat', 'chicken', 'beef', 'fish', 'salmon', 'formula', 'grain'],
    Medicine: ['medicine', 'pill', 'tablet', 'syrup', 'vaccine', 'bandage', 'ointment', 'drops', 'first aid', 'saline', 'injection', 'antiseptic', 'cream', 'gel', 'spray'],
    Accessories: ['collar', 'leash', 'harness', 'bed', 'toy', 'brush', 'shampoo', 'cage', 'bowl', 'clothes', 'belt', 'carrier', 'comb', 'litter', 'litter box', 'sandbox', 'tray', 'house', 'mat', 'blanket', 'rope', 'ball', 'stick', 'perch']
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => text.includes(word))) {
      return category;
    }
  }

  return 'Other';
};

const aiCategorize = async (title, description) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in .env, falling back to local categorization.");
      return localCategorize(title, description);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the gemma-3-1b-it model which works with active quota
    const model = genAI.getGenerativeModel({ model: "gemma-3-1b-it" });
    
    // Make the prompt as clear as possible
    let fullPrompt = `Categorize this pet product STRICTLY.

Product: ${title}
Details: ${description}

ANSWER RULES:
1. If it contains "litter" → Answer "Accessories"
2. If it contains "food" or "kibble" or "meat" or "treat" → Answer "Food" 
3. If it contains "medicine" or "vaccine" or "bandage" or "pill" or "first aid" → Answer "Medicine"
4. Otherwise → Answer "Other"

ANSWER WITH ONLY: Accessories, Food, Medicine, or Other`;

    // Special case: if title contains litter, force correct answer
    if (title.toLowerCase().includes('litter')) {
      console.log(`🚨 Detected "litter" in title "${title}" - forcing Accessories`);
      return 'Accessories';
    }
    
    // Check for medicine keywords
    const medicineKeywords = ['medicine', 'vaccine', 'bandage', 'pill', 'first aid', 'ointment', 'injection'];
    if (medicineKeywords.some(kw => title.toLowerCase().includes(kw) || description.toLowerCase().includes(kw))) {
      console.log(`🚨 Detected medicine keywords - forcing Medicine`);
      return 'Medicine';
    }
    
    // Check for food keywords
    const foodKeywords = ['food', 'kibble', 'meat', 'treat', 'canned'];
    if (foodKeywords.some(kw => title.toLowerCase().includes(kw) || description.toLowerCase().includes(kw))) {
      console.log(`🚨 Detected food keywords - forcing Food`);
      return 'Food';
    }

    const result = await model.generateContent(fullPrompt);
    
    const response = await result.response;
    const text = response.text().trim();
    
    console.log(`🤖 AI Response for "${title}": "${text}"`);
    
    const allowed = ['Food', 'Medicine', 'Accessories', 'Other'];
    const matched = allowed.find(cat => text.includes(cat) || text.toLowerCase().includes(cat.toLowerCase()));
    
    if (matched) {
      console.log(`✅ AI categorized as: ${matched}`);
      return matched;
    }
    
    console.log(`⚠️ AI response not recognized, using local categorization`);
    return localCategorize(title, description);
  } catch (error) {
    console.error("AI Categorization Error:", error.message);
    console.log(`⚠️ Falling back to local categorization for "${title}"`);
    return localCategorize(title, description);
  }
};

module.exports = { localCategorize, aiCategorize };
