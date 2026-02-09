const {
  Getprompt,
  GeminiCall,
  cleanAndParseJSON,
  getRentServices,
  GetBudgetPropertyService,
  GetCategoryPropertyService,
} = require("../services/geminiService");
const { SetUserBehaviorService } = require("../services/user_behavior");
const { getAllApprovedPropertyService } = require("../services/userService");

const PropertyVerifiedAi = async (req, res) => {
  
   const  Id = req.user.id;
  

  try {
    const { mode, answers, questions } = req.body;
    console.log(mode, answers, questions);

    if (mode == "budget") {
      const prompt = Getprompt(mode, answers, questions);

      const Geminiresponse = await GeminiCall(prompt);

      const cleanResponse = cleanAndParseJSON(Geminiresponse);

      const { data: BudgetProperties, error } = await GetBudgetPropertyService(
        cleanResponse.safe_purchase_limit, Id
      );

      if (error) {
        console.log("Error Occurs in  Getting in the Budget Property", error);
      }

      res.json({
        message: "User created successfully",
        cleanResponse,
        BudgetProperties,
      });
    } else if (mode == "rent") {
      const cleanResponse = await getRentServices(answers ,Id);

      res.json({ message: "Rent match successfully", cleanResponse });
    } else if (mode == "category") {
      const prompt = Getprompt(mode, answers, questions);
      const Geminiresponse = await GeminiCall(prompt);
      const cleanResponse = cleanAndParseJSON(Geminiresponse);

       const { data: CategoryProperties, error } = await GetCategoryPropertyService (
        cleanResponse.area , answers[0]
      );
    
       const {data:user_behavior , error :user_behavior_error}  = await SetUserBehaviorService({ userId : Id , city:answers[0] , occupation:answers[1] ,lifestyle:answers[2] , family_type:answers[3] }) 
       
        if (user_behavior_error) return console.log("Error occur in the inserion" , user_behavior_error)



      if (error) {
        console.log("Error Occurs in  Getting in the Budget Property", error);
      }

      console.log(CategoryProperties)
      
      res.json({ message: " Category match successfully", cleanResponse ,CategoryProperties });
    } else if (mode == "discuss") {
      const Property =  await getAllApprovedPropertyService() 
      const prompt = Getprompt(mode, answers, questions, Property);
      console.log(prompt);
      const Geminiresponse = await GeminiCall(prompt);
      const cleanResponse = cleanAndParseJSON(Geminiresponse ,"disscus");
      console.log("Gemini Response - ",Geminiresponse)
      

      res.json({ message: "Rent match successfully", cleanResponse });
    } else {
      return res.status(400).json({ error: "Invalid mode" });
    }
  } catch (err) {
    res.status(500).json({ error: "error in the response" });
  }
};

module.exports = { PropertyVerifiedAi };
