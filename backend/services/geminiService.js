const { GoogleGenerativeAI } = require("@google/generative-ai");
const { supabaseAdmin } = require("../config/supabaseClient");
const { json } = require("express");
const { SetUserBehaviorService } = require("./user_behavior");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function GeminiCall(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    throw error;
  }
}

const Getprompt = (mode, answer, question) => {
  if (mode == "budget") {
    return `
        your the Budget analyiser for the for the Property whcih porperty kind of property should buy 
        so the user answer some question-> 
       ${
         question
           .map((item, index) => {
             return `
          Question: ${item}
          Answer: ${answer[index]}`;
           })
           .join("\n") // Joins the array into a single string
       }
     as the   Budget analyiser analyses the budget using answer return output in json as follows 
      {
       safe_purchase_limit : analyis the Safe Purchase Limit the limit in the lowernumber-uppernumber limit in Number format ,
       emi_capacity : give the emi capacity for the per month,
       risk:risk level (high , low , mid),
       recommandation : why to buy this kind of budget with satatisics and make it short of 2-3 lines only   
      }
      
      `;
  }
  if (mode == "category") {
    return `
        your the People's Category Choice analyiser for the for the Property , which take the question and find the best suitable envoirnemt
        depend on there profession in his particular area of his city    
        so the user answer some question-> 
       ${
         question
           .map((item, index) => {
             return `
          Question: ${item}
          Answer: ${answer[index]}`;
           })
           .join("\n") // Joins the array into a single string
       }
     as the People's Category Choice analyiser the question and find the best suitable spot in that are using answer return output in json as follows 
      {
       best_match :best_match according to his profession what is best for him to be a part of , means if he is a  IT Professionals then the best match is Young IT Professionals Hub  ,
       recommandation : why this is the best match  and make it short of 2-3 lines only  , 
       area : Which area of the city his perfect for him it will be the array and it will only be the area name not the discription  , 
       people : Or any people in that particular who belongs to same profession or the diffrent but can help you and give there personal info like name , profession and area and the image link ,
       matching_score : it is a score for from 1 to 100 which tell how many the area is match for the user
      }
       donot give the Explanation of Choices only json response       `;
  } else if (mode == "discuss") {
    return `
    You are “AI Discuss”, a smart, minimalistic real-estate intelligence assistant.

Your role is to help users understand property, rent, investment, location,
area reviews, legal terms (RERA, OC, etc.), developing areas, and market trends
in a SIMPLE, SHORT, and TRUST-BUILDING way.

You are NOT a sales agent.
You are a decision-support guide.

----------------------------
CORE BEHAVIOR RULES
----------------------------

1. ALWAYS answer in SHORT FORMAT:
   - 1–2 line direct answer
   - Max 3 bullet points
   - No long paragraphs
   - No marketing language

2. AFTER EVERY ANSWER:
   - Provide EXACTLY 3 related suggestions
   - Suggestions must be clickable-style questions
   - Suggestions must be DIRECTLY related to the user’s question
   - Do NOT repeat the same suggestions again

3. BELOW SUGGESTIONS:
   - Recommend relevant properties automatically
   - Only show properties related to:
     location, intent (buy/rent/invest), topic
   - Mention why they are recommended (short tag)

4. USER CONTROL:
   - User can ignore suggestions anytime
   - User can type a new custom question anytime
   - Never force the user into suggestions


----------------------------
ANSWER STRUCTURE (MANDATORY)
----------------------------

Use this exact JSON format:

{
  SHORT_ANSWER : 
    <3–4 lines, simple explanation use github <markdown>
  
  
  KEY_POINTS:[
    Point 1,  
    Point 2,  
    Point 3,  
  ]
  
  
  SUGGESTIONS :
[
   <Suggestion 1>
   <Suggestion 2>
   <Suggestion 3>
  ]
  
  RECOMMENDED_PROPERTIES:
  
    Property Name – Location – Reason / Tag 
    Property Name – Location – Reason / Tag  
    Property Name – Location – Reason / Tag  
  ]

}

----------------------------
TOPIC HANDLING RULES
----------------------------

• If user asks legal terms (RERA, OC, Agreement):
  - Explain in layman language
  - Highlight buyer benefit
  - Show ONLY verified properties

• If user asks about AREA / LOCATION:
  - Include safety, connectivity, development, demand
  - Keep it short
  - Show properties from that area only

• If user asks about INVESTMENT:
  - Mention growth potential
  - Mention one risk (mandatory)
  - Show “Good for Investment” tagged properties

• If user asks RENT / PG:
  - Focus on comfort, demand, affordability
  - Show rental properties only

• If user asks GENERAL QUESTION:
  - Educate first
  - Suggest logical next steps
  - Never upsell aggressively

----------------------------
SUGGESTION GENERATION RULES
----------------------------

Suggestions must:
- Be natural next questions
- Be simple Hindi-English mix if user is Hindi
- Be no more than 6–8 words each
- Never be generic like “Learn more”

Examples:
✔ “Check resale potential”
✔ “Compare nearby areas”
✔ “Show RERA verified projects”

----------------------------
PROPERTY RECOMMENDATION RULES
----------------------------

For each property:
- Mention ONE clear reason
- Add a small trust tag:
  (RERA Verified / Good for Investment / Family Friendly / Developing Area)

Example:
- Skyline Homes – Baner – Good for Investment
- Green Nest – Wakad – Family Friendly

----------------------------
TONE & STYLE
----------------------------

• Friendly
• Neutral
• Trustworthy
• Non-salesy
• Simple language
• Hindi-English mix allowed
• No emojis overload

----------------------------
IMPORTANT RESTRICTIONS
----------------------------

❌ No long explanations  
❌ No pressure like “Buy now”  
❌ No fake certainty  
❌ No biased selling  
❌ No technical jargon without explanation  

----------------------------
FINAL GOAL
----------------------------

User should feel:
“I am getting clarity, not being sold to.”

AI Discuss should feel like:
A smart friend + real estate expert + search assistant.d answer the question in the json format only json
      the question of the user is 
      question :${answer} 

give me the Markdown Mode means you can use Markdown Bold, Italic tags that you use bold the headings 
and and line to sperated things and strict in JSON Formate 
   
      
    `;
  } else {
    return `new mode : ${mode}`;
  }
};

const cleanAndParseJSON = (aiResponseString , mode) => {
  // 1. Remove "```json" (case insensitive) and "```"
  // 2. Trim extra whitespace
  const cleanString = aiResponseString
    .replace(/```json/gi, "") // Remove opening fence
    .replace(/```/g, "") // Remove closing fence
    .trim(); // Remove leading/trailing whitespace 
  try {
    // 3. Convert string to actual JSON Object
   
    // return mode == "disscus" ? cleanString : JSON.parse(cleanString);

    return JSON.parse(cleanString);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null; // or handle error appropriately
  }
};

const getRentServices = async (answer, Id) => {
  const city = answer[0];
  const RoomeType = answer[1];
  const budget = answer[2].replace("₹", "").split("-");
  const MinBudget = Number(budget[0].replace(",", ""));
  const MaxBuget = Number(budget[1].replace(",", "").replace("+", ""));
  const room = answer[3] == "Room" ? "Apartment" : "Apartment"; // Fix this logic
  const profession = answer[4];
  const Lifestyle = answer[5]; // You're missing this!
  const RoomatePerfer = answer[6];
  const Foodpreference = answer[7];
  const DrinksAndSmokeAllowed =
    answer[8] == "Do Smoking"
      ? "Smoking Allowed"
      : answer[8] == "Do Drinking"
      ? "Drinking allowed"
      : answer[8] == "Do Both"
      ? "Both"
      : answer[8] == "Do None"
      ? "None"
      : "Unknown";

  // DON'T remove spaces - keep original format
  const Religion = answer[9]; 
  const Gender = answer[10];

  const Final_budget = `₹${MinBudget}-₹${MaxBuget}`;

  let query = supabaseAdmin
    .from("propertyapproval")
    .select("*, user_id(name)")
    .eq("looking_for", "Rent / Lease")
    .eq("city", city)
    .eq("property_type", room)
    .eq("profession", profession) // Add this
    .eq("Lifestyle", Lifestyle) // Add this
    .eq("RoomatePerfer", RoomatePerfer)
    .eq("Foodpreference", Foodpreference)
    .eq("DrinksAndSmokeAllowed", DrinksAndSmokeAllowed)
    .eq("Religion", Religion) // Keep spaces
    .eq("available_for", Gender) // Keep spaces
    .eq("roomtype", RoomeType)
    .gte("price", MinBudget)
    .lte("price", MaxBuget);

  console.table({
    city,
    room,
    profession,
    Lifestyle,
    RoomatePerfer,
    Foodpreference,
    DrinksAndSmokeAllowed,
    Religion,
    RoomeType,
    MinBudget,
    MaxBuget,
    Final_budget,
    Gender
  });

  // Save user behavior
  const { data: user_behavior, error: user_behavior_error } =
    await SetUserBehaviorService({
      userId: Id,
      Rent_area: city,
      Rent_Budget: Final_budget,
      Rent_property_type: room,
      Roommate_type: RoomatePerfer,
      Food_perferances: Foodpreference,
      DrinkOrSmoke: DrinksAndSmokeAllowed,
      Religion: Religion
    });

  if (user_behavior_error) {
    console.log("Error in insertion:", user_behavior_error);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Supabase query error:", error);
    throw new Error(error.message);
  }

  console.log("Query results:", data);
  return data || [];
};

const GetBudgetPropertyService = async (budget ,Id) => {
  const Budget = budget.split("-");
  const min = Budget[0];
  const max = Budget[1];

  const Final_budget  = String(`₹${min}-₹${max}`)

    const { data: user_behavior, error: user_behavior_error } =
    await SetUserBehaviorService({
      userId: Id,
      Purchase_Budget:Final_budget
    });

  if (user_behavior_error)
    return console.log("Error occur in the inserion", user_behavior_error);


  return await supabaseAdmin
    .from("propertyapproval")
    .select("*")
    .gte("price", min)
    .lte("price", max)
    .limit(2);
};

const GetCategoryPropertyService = async (lowerArea, city) => {
  console.log(lowerArea);
  const orCondition = lowerArea
    .map((area) => `location.ilike.%${area}%`)
    .join(",");
  
    

  return await supabaseAdmin
    .from("propertyapproval")
    .select("*, bookings(count)")
    .eq("city", city)
    .or(orCondition)
    .limit(2);
};

const GetAIresponseUserService = async (user_behavior, property_details) => {
  const prompt = `You are an AI property purchase predictor. Analyze the user's search history and behavior patterns, then evaluate how well the given property matches their preferences.

TASK:
Compare the user's historical search patterns with the property details provided and predict the likelihood of purchase.

USER SEARCH HISTORY & BEHAVIOR:
${JSON.stringify(user_behavior, null, 2)}

PROPERTY DETAILS TO EVALUATE:
${JSON.stringify(property_details, null, 2)}

NOTE: 
- In the USER SEARCH HISTORY & BEHAVIOR Changes -> 
Rent_area 
Rent_Budget
Rent_property_type
Profession 
Rommate_type 
Food_perferances
DrinkOrSmoke
Religion 
are the Rent deatails use this details when the Looking_for in the PROPERTY DETAILS is
Rent / Lease Other are the selling Detials 


ANALYSIS INSTRUCTIONS:
1. Examine the user's historical preferences:
   - Preferred cities and locations
   - Occupation and lifestyle patterns
   - Family type and living situation
   - Consistency or changes in search behavior

2. Match against property characteristics:
   - Location alignment (city, specific area)
   - Property type and size suitability
   - Lifestyle compatibility (social/quiet preferences)
   - Price point reasonableness for their profile
   - Amenities and features match
   - Availability alignment (gender preference, tenant type)

3. Consider deal-breakers and strong matches:
   - Identify any mismatches that would significantly reduce purchase likelihood
   - Highlight strong alignment factors that increase purchase probability

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object with no additional text, explanations, or markdown formatting. Use this exact structure:

{
  "AI_Percentage": <number between 0-100 , which is the chance of , how likily the user will buy the porperty> ,
  "AI_Description": "<4-5 sentences explaining the key factors influencing the prediction, including both positive matches and concerns>",
  "AI_Behaviortype": "<1-3 words describing the user's primary property preference pattern, e.g., 'Urban Social Living', 'Budget Conscious', 'Family Oriented'>"
}

IMPORTANT:
- AI_Percentage should be realistic (0-100), considering all matching and mismatching factors
- Interprete like that it we are showing user interest not the serach history expose
- AI_Description should be specific and reference actual data points from the analysis
- AI_Behaviortype should capture the essence of what drives the user's property decisions
- Return ONLY the JSON object, nothing else`;

  const data = await GeminiCall(prompt);
  const cleanResponse = cleanAndParseJSON(data);

  console.log(data);

  return {
    AI_Percentage: cleanResponse.AI_Percentage,
    AI_Description: cleanResponse.AI_Description,
    AI_Behaviortype: cleanResponse.AI_Behaviortype,
  };
};

module.exports = {
  GeminiCall,
  Getprompt,
  cleanAndParseJSON,
  getRentServices,
  GetBudgetPropertyService,
  GetCategoryPropertyService,
  GetAIresponseUserService,
};
