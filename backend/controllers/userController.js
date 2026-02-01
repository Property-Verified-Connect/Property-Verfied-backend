// controllers/userController.js
const { supabaseAdmin } = require("../config/supabaseClient");
const {
  getFlagvalueService,
  checkSuspiciousPartnerService,
} = require("../services/adminService");
const { GetAIresponseUserService } = require("../services/geminiService");
const { SetUserBehaviorService } = require("../services/user_behavior");
const {
  getUserById,
  getAllApprovedPropertyService,
  getApprovedPropertybyIDService,
  setApprovalBookingService,
  getBookingforApprovalService,
  getBookingforApprovalbyIDService,
  setBookingtoApprovalService,
  getApprovedBookingService,
  getUserOrderService,
  AddPropertyInWishlistService,
  getWhishlistPropertyByIdService,
  DelectInWishlistService,
  getUserBehaviorService,
} = require("../services/userService");

const getProfile = async (req, res) => {
  try {
    const { data, error } = await getUserById(req.user.id);
    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const getDashboard = (req, res) => {
  res.json({ message: `Welcome ${req.user.role}` });
};

const getAllApprovedProperty = async (req, res) => {
  try {
    const { data, error } = await getAllApprovedPropertyService();

    if (error) throw error;

    res.status(200).json({
      message: "✅ ALL properties fetched successfully",
      properties: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const getWhishlistPropertyById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { data, error } = await getWhishlistPropertyByIdService(user_id);

    if (error) {
      return res.status(400).json({
        message: "Property Already exist",
      });
    }

    res.status(200).json({
      message: "✅ ALL properties fetched successfully",
      properties: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const getApprovedPropertybyID = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const { data, error } = await getApprovedPropertybyIDService(id); // optional: newest first

    if (error) throw error;

    res.status(200).json({
      message: "✅ properties fetched successfully",
      properties: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const setApprovalBooking = async (req, res) => {
  try {
    const { propertyid, visitType, date, timeSlot, partnerId } = req.body;
    const user = req.user;
    const suspected = await checkSuspiciousPartnerService(partnerId);

    console.log(propertyid, visitType, date, timeSlot, user.id, partnerId);
    const { data: property_details, error: property_details_error } =
      await getApprovedPropertybyIDService(propertyid);

    if (!partnerId) {
      return res.json({ message: " partner id missing" });
    }

    const { data: user_behavior_data, error: user_behavior_error } =
      await getUserBehaviorService(user.id);

    if (user_behavior_error) {
      return res.json({ message: "user behvaior missing" });
    }

    console.log("user Behavior data - ", user_behavior_data);

    const { AI_Percentage, AI_Description, AI_Behaviortype } =
      await GetAIresponseUserService(user_behavior_data, property_details);

    const { data, error } = await setApprovalBookingService(
      propertyid,
      visitType,
      date,
      timeSlot,
      user.id,
      suspected.data.suspect ,
      AI_Percentage, AI_Description, AI_Behaviortype 
    );

    if (error) throw error;

    res.status(200).json({
      message: "✅ properties fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const getBookingforApproval = async (req, res) => {
  try {
    const { data, error } = await getBookingforApprovalService();

    if (error) throw error;

    res.status(200).json({
      message: "✅ properties fetched successfully",
      booking: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const getBookingforApprovalbyID = async (req, res) => {
  try {
    const { id } = req.body;

    const { data, error } = await getBookingforApprovalbyIDService(id);

    if (error) throw error;

    res.status(200).json({
      message: "✅ properties fetched successfully",
      booking: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const setBookingtoApproval = async (req, res) => {
  try {
    const { id } = req.body;

    const { data, error } = await setBookingtoApprovalService(id);

    if (error) throw error;

    res.status(200).json({
      message: "✅ properties fetched successfully",
      booking: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const getApprovedBooking = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { data, error } = await getApprovedBookingService(partnerId);

    if (error) throw error;

    res.status(200).json({
      message: "✅ properties fetched successfully",
      booking: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const getUserOrder = async (req, res) => {
  try {
    const user = req.user.id;

    const { data, error } = await getUserOrderService(user);

    if (error) throw error;

    res.status(200).json({
      message: "✅order fetched successfully",
      booking: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const AddPropertyInWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const user_id = req.user.id;

    const { data, error } = await AddPropertyInWishlistService(
      user_id,
      propertyId
    );

    if (error) {
      return res.status(400).json({
        message: "Property Already exist",
      });
    }

    res
      .status(200)
      .json({ message: "property is added in the whislist", data: data });
  } catch (error) {
    console.error("Property not add", error);
  }
};

const DelectInWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const user_id = req.user.id;

    const { data, error } = await DelectInWishlistService(user_id, propertyId);

    if (error) {
      console.log("Error occur in the insertion", error);
    }

    res
      .status(200)
      .json({ message: "property deleted in the whislist", data: data });
  } catch (error) {
    console.error("Property not add", error);
  }
};


const  SetUserInterest = async (req , res) => {
   try {
    const  submitData  = req.body;
    const Id = req.user.id
     
    console.log(submitData)
    
    SetUserBehaviorService({
      userId:Id,
      city : submitData.area,
      Purchase_Budget: submitData.income,
      occupation:submitData. profession,
      Rent_property_type:submitData.propertyType
    })

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ is_Interested_filled: true })
      .eq("id", Id);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ message: "Failed to update interest" });
    }

 console.log("added")
    res.status(200)
      .json({ message: "Interest Added"});
  } catch (error) {
    console.error("Property not add", error);
  }
   
}
 



module.exports = {
  getProfile,
  getDashboard,
  getAllApprovedProperty,
  getApprovedPropertybyID,
  setApprovalBooking,
  getBookingforApproval,
  getBookingforApprovalbyID,
  setBookingtoApproval,
  getApprovedBooking,
  getUserOrder,
  AddPropertyInWishlist,
  getWhishlistPropertyById,
  DelectInWishlist,
  SetUserInterest
};
