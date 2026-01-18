const { supabaseAdmin } = require('../config/supabaseClient');

 const partnerIDprojectNameService = async (projectName) => {
  return await supabaseAdmin.from('propertyapproval').select("user_id").eq('property_name',projectName).single()
};

const referIntoDBService = async (
  customerName,
  contactNumber,
  profession,
  budgetRange,
  projectName,
  notes,
  referralName,
  partner_id,
  flag
) => {
      return await supabaseAdmin
    .from('customer_leads') // ✅ make sure this matches your actual table name
    .insert([
      {
        customer_name: customerName,
        contact_number: contactNumber,
        profession: profession,
        budget_range: budgetRange,
        project_name: projectName,
        notes: notes,
        referral_name: referralName,
        user_id: partner_id, 
        status:flag == false ? "approved": "pending"
      },
    ]);

};

 const getCustomerleadService = async () => {
  return await supabaseAdmin.from('customer_leads').select("*,user_id(name)").eq("status","pending").order('created_at', { ascending: false });
};


 const setCustomerleadtoApprovalService = async (id) => {
  return await  supabaseAdmin
    .from('customer_leads')
    .update({ status: 'approved' })
    .eq('id', id)
    .single();
};


 const setCustomerleadStatusService = async (id , status) => {
  return await  supabaseAdmin
    .from('customer_leads')
    .update({ status: status })
    .eq('id', id)
    .single();
};




 const getAllApprovedLeadService = async (id) => {
  return await supabaseAdmin.from('customer_leads').select("*,user_id(name)").neq("status","pending").order('created_at', { ascending: false }).eq("user_id",id);
};


  const getPropertyNameService = async() =>{
    return await supabaseAdmin.from("propertyapproval").select("property_name")
  }



module.exports = { partnerIDprojectNameService , referIntoDBService 
  , getCustomerleadService ,setCustomerleadtoApprovalService ,getAllApprovedLeadService 
 ,getPropertyNameService , setCustomerleadStatusService}