// controllers/authController.js

const {
  getFlagvalueService,
  checkSuspiciousPartnerService,
} = require("../services/adminService");
const {
  partnerIDprojectNameService,
  referIntoDBService,
  getCustomerleadService,
  setCustomerleadtoApprovalService,
  getAllApprovedLeadService,
  getPropertyNameService,
  setCustomerleadStatusService,
  setTermService,
} = require("../services/referService");
const { getFlagValue } = require("./adminController");

const referIntoDB = async (req, res) => {
  try {
    const {
      customerName,
      contactNumber,
      profession,
      budgetRange,
      projectName,
      notes,
      referralName,
    } = req.body;

    console.log(projectName);

    let userId = null;
    let suspect = null;

    if (projectName !== "Other") {
      const { data, error } = await partnerIDprojectNameService(projectName);

      if (error) {
        return res.status(400).json({ error: "Failed to get partner ID" });
      }

      console.log("partner id - ", data.user_id);
      userId = data.user_id;

      const flag = await checkSuspiciousPartnerService(data.user_id);
      console.log("flag - ", flag);
      suspect = flag.data.suspect;
    }

    const { data: stageData, error: stageerror } = await referIntoDBService(
      customerName,
      contactNumber,
      profession,
      budgetRange,
      projectName,
      notes,
      referralName,
      userId,
      suspect,
    );

    console.log("stage error", stageerror);

    res.json({
      message: "refer instead ✨",
      error: stageerror ? stageerror : null,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "refer instead fail ✨", details: err.message });
  }
};

const getAllLeadtoApproved = async (req, res) => {
  try {
    const { data, error } = await getCustomerleadService();

    if (error) throw error;

    res.status(200).json({
      message: "✅ properties fetched successfully",
      customer_leads: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const setCustomerleadtoApproval = async (req, res) => {
  try {
    const { id } = req.body;

    const { data, error } = await setCustomerleadtoApprovalService(id);

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

const getAllApprovedLead = async (req, res) => {
  try {
    const user = req.user.id;
    console.log(" partner id with get - ", user);
    const { data, error } = await getAllApprovedLeadService(user);

    if (error) throw error;

    res.status(200).json({
      message: "✅ properties fetched successfully",
      customer_leads: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const getPropertyName = async (req, res) => {
  try {
    const { data, error } = await getPropertyNameService();

    if (error) throw error;

    res.status(200).json({
      message: "✅ Property Name fetched successfully",
      Property_name: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

const setCustomerleadStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    const { data, error } = await setCustomerleadStatusService(id, status);

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

const SetTerm = async (req, res) => {
  try {
    const  user  = req.user.id;
    console.log(user)

    const { data, error } = await setTermService(user);

    if (error) throw error;

    res.status(200).json({
      message: "✅ properties fetched successfully",
      IsTerm: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  referIntoDB,
  getAllLeadtoApproved,
  setCustomerleadtoApproval,
  setCustomerleadStatus,
  getAllApprovedLead,
  getPropertyName,
  SetTerm
};
