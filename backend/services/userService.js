const { supabaseAdmin } = require("../config/supabaseClient")

const createUserInDB = async (userData) => {
  return await supabaseAdmin.from('users').insert([userData]);
};


const getUserById = async (id) => {
  return await supabaseAdmin.from('users').select('*').eq('id', id).single();
};

const getAllApprovedPropertyService = async()=>{
  return await supabaseAdmin
      .from("propertyapproval")
      .select(`*, users (
        id,
        name,
        email,
        contact
      )`).eq("status","adminApproved")
      .order("created_at", { ascending: false }); 
};


const getWhishlistPropertyByIdService = async(user_id)=>{
  return await supabaseAdmin
      .from("wishlist")
      .select(`*, property_id (*)`).eq("user_id", user_id)
      .order("created_at", { ascending: false }); 
};


const getApprovedPropertybyIDService = async(id) =>{
  return await supabaseAdmin.from('propertyapproval').select(`*, users (
        id,
        name,
        email,
        contact
      )`).eq('id', id).single();
}


const setApprovalBookingService = async(propertyid, visitType, date, timeSlot ,userid ,suspect , AI_Percentage, AI_Description, AI_Behaviortype ) =>{
  return await supabaseAdmin
      .from('bookings')
      .insert({
        property_approved: propertyid,
        user_id: userid,
        visit_type: visitType,
        visit_date: date,
        visit_time: timeSlot,
        status: suspect ==false ? 'approved': 'pending',
         AI_Percentage, 
         AI_Description, 
         AI_Behaviortype 
      })
      .select()
      .single();
}


const getUserBehaviorService  = async (id) =>{
    return supabaseAdmin.from("user_behavior").select("*").eq( "user_id" ,id);
}





const getBookingforApprovalService = async () => {
  return await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      property_approved(
        id,
        location,
        city,
        property_type,
        property_name,
        price,
        photos,
        user_id (
          id,
          name,
          email
        )
      ),
      user_id (
        id,
        name,
        email,
        contact
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

}


const getBookingforApprovalbyIDService = async (id) => {
  return await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      property_approved(
      *,user_id(*)
      ),
      user_id (
        id,
        name,
        email,
        contact
      )
    `)
    .eq('id', id)
    .single();
}


const setBookingtoApprovalService = async (id) => {
  return await supabaseAdmin
    .from('bookings')
    .update({ status: 'approved' })
    .eq('id', id)
    .single();
}



const getApprovedBookingService = async (id) => {
  return await supabaseAdmin
    .from('bookings')
    .select(`
      *,
       property_approved!inner(
        id,
        location,
        city,
        property_type,
           property_name,
           looking_for,
        price,
        photos,
        user_id (
          id,
          name,
          email
        )
      ),
      user_id (
        id,
        name,
        email,
        contact
      )
    `).eq("property_approved.user_id",id)
    .order('created_at', { ascending: false });
}


const getUserOrderService = async (id) =>{
  return supabaseAdmin.from('bookings').select(` *, property_approved(
        id,
        location,
        city,
        property_type,
        price,
        property_name,
        photos,
        looking_for,
        user_id (
          id,
          name,
          email,
          contact
        )
      )
    `).eq("user_id" ,id)
}


const AddPropertyInWishlistService = async (user_id, propertyid) => {
  // 1️⃣ Check existing
  const { data: existing } = await supabaseAdmin
    .from("wishlist")
    .select("id")
    .eq("user_id", user_id)
    .eq("property_id", propertyid)
    .single();

  if (existing) {
    return { data: null, error: { message: "Already wishlisted" } };
  }

  // 2️⃣ Insert
  return await supabaseAdmin
    .from("wishlist")
    .insert({ user_id, property_id: propertyid })
    .select()
    .single();
};


const DelectInWishlistService = async (user_id, propertyid) => {
  return await supabaseAdmin
    .from("wishlist")
    .delete()
    .eq("user_id", user_id)
    .eq("property_id", propertyid)
    .select();
};





module.exports = { createUserInDB, getUserById 
,getAllApprovedPropertyService ,getApprovedPropertybyIDService,
setApprovalBookingService ,getBookingforApprovalService,
getBookingforApprovalbyIDService ,setBookingtoApprovalService ,
getApprovedBookingService ,
getUserOrderService,AddPropertyInWishlistService,
getWhishlistPropertyByIdService,
DelectInWishlistService,
getUserBehaviorService 
};