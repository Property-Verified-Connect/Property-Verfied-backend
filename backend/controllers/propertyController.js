const { json } = require("express");
const {
  getFlagvalueService,
  checkSuspiciousPartnerService,
} = require("../services/adminService");
const propertyService = require("../services/propertyService");

exports.createProperty = async (req, res) => {
  try {
    const user = req.user; // from authMiddleware
    // Form fields come in req.body (all strings) and files in req.files
    const body = req.body;

    const suspected = await checkSuspiciousPartnerService(user.id);
    console.log("Supected Found", suspected.data);
    if (!suspected) {
      return res.json({ message: "flag || suspect missing missing" });
    }

    let rawOptions = body.Options;
    let optionsPayload = null;

    if (rawOptions) {
      let optionsArray = Array.isArray(rawOptions) ? rawOptions : [rawOptions];
      const flatOptions = optionsArray.flat(Infinity).filter((item) => item);

      const arrayLiteral = `{${flatOptions.join(",")}}`;

      optionsPayload = arrayLiteral; // e.g., '{Parking,Security,Mart,Pool}'
    }

    const payload = {
      user_id: user.id,
      looking_for: body.lookingFor || null,
      property_kind: body.propertyKind || null,
      property_type: body.propertyType || null,
      property_name: body.propertyName || null,
      contact: body.contact || null,
      city: body.city || null,
      location: body.location || null,
      bedroom: body.bedroom || null,
      bathroom: body.bathroom || null,
      balconies: body.balconies || null,
      roomtype: body.roomtype || null,
      area: body.Area || null,
      area_unit: body.Areaunit || null,
      floor: body.floor || null,
      age_property: body.ageproperty || null,
      available: body.available || null, // expected YYYY-MM-DD
      available_for: body.availablefor || null,
      suitable_for: body.suitablefor || null,
      social_media: body.socialMedia || null,
      price: body.price ? parseFloat(body.price) : null,
      description: body.description || null,
      capacity: body.capacity || null,
      alreadyrent: body.alreadyrent || null,
      profession: body.profession || null,
      Lifestyle: body.Lifestyle || null,
      Apartmentsize: body.Apartmentsize || null,
      Options: optionsPayload,
      brochure: body.brochure || null,
      photos: null,
      Ownership: body.Ownership || null,
      CarpetAreaUnit: body.CarpetAreaUnit || null,
      BuildupAreaUnit: body.BuildupAreaUnit || null,
      SuperBuildupAreaUnit: body.SuperBuildupAreaUnit || null,
      CarpetArea: body.CarpetArea || null,
      BuildupArea: body.BuildupArea || null,
      allInclusive: body.allInclusive || null, // ✅ Add this
      priceNegotiable: body.priceNegotiable || null, // ✅ Add this
      taxExcluded: body.taxExcluded || null,
      SuperBuildupArea: body.SuperBuildupArea || null,
      AvailabilityStatus: body.AvailabilityStatus || null,
      lengthPlot: body.lengthPlot || null,
      breathPlot: body.breathPlot || null,
      Boundary: body.Boundary || null,
      openSide: body.openSide || null,
      sanctionType: body.sanctionType || null,
      sanctionNo: body.sanctionNo || null,
      isNoise: body.isNoise || null,
      Foodpreference: body.Foodpreference || null,
      DrinksAndSmokeAllowed: body.DrinksAndSmokeAllowed || null,
      RoomatePerfer: body.RoomatePerfer || null,
      Religion: body.Religion || null,
      construction: body.construction || null,
      status: suspected.data.suspect == false ? "adminApproved" : "pending",
    };

    // Insert row first to get property id
    const inserted = await propertyService.insertPropertyRow(payload);
    const propertyId = inserted.id;

    // If files exist, upload them to storage and collect URLs
    const files = req.files || [];
    const uploadedUrls = [];

    for (const file of files) {
      // file: { originalname, buffer, mimetype }
      const safeName = `${Date.now()}_${file.originalname.replace(
        /\s+/g,
        "_"
      )}`;
      const path = `properties/${propertyId}/${safeName}`;

      const publicUrl = await propertyService.uploadBufferToStorage(
        path,
        file.buffer,
        file.mimetype
      );
      uploadedUrls.push(publicUrl);
    }

    // Update property with photos URLs (array)
    if (uploadedUrls.length > 0) {
      await propertyService.updatePropertyPhotos(propertyId, uploadedUrls);
    }

    return res.json({
      success: true,
      property: { ...inserted, photos: uploadedUrls },
    });
  } catch (err) {
    console.error("createProperty error", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};



exports.updateProperty = async (req, res) => {
  try {
    const user = req.user; // from authMiddleware
    const { propertyId } = req.params; // Get property ID from URL params
    const body = req.body;

    console.table({body})

    // Check if property exists and belongs to user
    // const existingProperty = await propertyService.getPropertybyIDService(propertyId);
    // if (!existingProperty) {
    //   return res.status(404).json({ error: "Property not found" });
    // }

    // console.log(existingProperty)

    // // Check if user owns this property (optional security check)
    // if (existingProperty.user_id !== user.id) {
    //   return res.status(403).json({ error: "Unauthorized to update this property" });
    // }

    // // Check suspicious partner status
 

    // // Handle Options field (same logic as create)
    let rawOptions = body.Options;
    let optionsPayload = null;

    if (rawOptions) {
      let optionsArray = Array.isArray(rawOptions) ? rawOptions : [rawOptions];
      const flatOptions = optionsArray.flat(Infinity).filter((item) => item);
      const arrayLiteral = `{${flatOptions.join(",")}}`;
      optionsPayload = arrayLiteral;
    }

    // // Build update payload - only include fields that are provided
    const payload = {};
    
    // Map all possible fields
    const fieldMappings = {
      lookingFor: 'looking_for',
      propertyKind: 'property_kind',
      propertyType: 'property_type',
      propertyName: 'property_name',
      contact: 'contact',
      city: 'city',
      location: 'location',
      bedroom: 'bedroom',
      bathroom: 'bathroom',
      balconies: 'balconies',
      roomtype: 'roomtype',
      Area: 'area',
      Areaunit: 'area_unit',
      floor: 'floor',
      ageproperty: 'age_property',
      available: 'available',
      availablefor: 'available_for',
      suitablefor: 'suitable_for',
      socialMedia: 'social_media',
      description: 'description',
      capacity: 'capacity',
      alreadyrent: 'alreadyrent',
      profession: 'profession',
      Lifestyle: 'Lifestyle',
      Apartmentsize: 'Apartmentsize',
      brochure: 'brochure',
      Ownership: 'Ownership',
      CarpetAreaUnit: 'CarpetAreaUnit',
      BuildupAreaUnit: 'BuildupAreaUnit',
      SuperBuildupAreaUnit: 'SuperBuildupAreaUnit',
      CarpetArea: 'CarpetArea',
      BuildupArea: 'BuildupArea',
      allInclusive: 'allInclusive',
      priceNegotiable: 'priceNegotiable',
      taxExcluded: 'taxExcluded',
      SuperBuildupArea: 'SuperBuildupArea',
      AvailabilityStatus: 'AvailabilityStatus',
      lengthPlot: 'lengthPlot',
      breathPlot: 'breathPlot',
      Boundary: 'Boundary',
      openSide: 'openSide',
      sanctionType: 'sanctionType',
      sanctionNo: 'sanctionNo',
      isNoise: 'isNoise',
      Foodpreference: 'Foodpreference',
      DrinksAndSmokeAllowed: 'DrinksAndSmokeAllowed',
      RoomatePerfer: 'RoomatePerfer',
      Religion: 'Religion',
      construction: 'construction',
    };

    // // Only add fields that are provided in the request
    Object.entries(fieldMappings).forEach(([bodyKey, dbKey]) => {
      if (body[bodyKey] !== undefined && body[bodyKey] !== null && body[bodyKey] !== '') {
        payload[dbKey] = body[bodyKey];
      }
    });

    // // Handle price separately (needs parsing)
    if (body.price !== undefined && body.price !== null && body.price !== '') {
      payload.price = parseFloat(body.price);
    }

    // // Handle Options
    if (optionsPayload !== null) {
      payload.Options = optionsPayload;
    }

    // // Update status based on suspect flag
 

    // // Handle file uploads if new files are provided
    const files = req.files || [];
    const uploadedUrls = [];

    if (files.length > 0) {
      for (const file of files) {
        const safeName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
        const path = `properties/${propertyId}/${safeName}`;

        const publicUrl = await propertyService.uploadBufferToStorage(
          path,
          file.buffer,
          file.mimetype
        );
        uploadedUrls.push(publicUrl);
      }

      // Merge with existing photos or replace based on your requirement
      // Option 1: Replace all photos
      payload.photos = uploadedUrls;

      // Option 2: Append to existing photos (uncomment if needed)
      // const existingPhotos = existingProperty.photos || [];
      // payload.photos = [...existingPhotos, ...uploadedUrls];
    }

    // Update the property
    const updated = await propertyService.updatePropertyService(body.id, payload);

    return res.json({
      success: true,
      property: updated,
    });
  } catch (err) {
    console.error("updateProperty error", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const { data, error } = await propertyService.getAllPropertiesService(); // optional: newest first

    if (error) throw error;

    res.status(200).json({
      message: "✅ ALL properties fetched successfully",
      count: data.length,
      properties: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertybyID = async (req, res) => {
  try {
    const { id } = req.body;
    const { data, error } = await propertyService.getPropertybyIDService(id); // optional: newest first

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

exports.setPropertytoApproval = async (req, res) => {
  try {
    const { id } = req.body;
    const { data, error } = await propertyService.setPropertytoApprovalService(
      id
    );

    if (error) throw error;

    res.status(200).json({
      message: "✅ Property Approved  successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.setBookingtoContact = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const { data, error } = await propertyService.setBookingtoContactService(
      propertyId
    );

    if (error) throw error;

    res.status(200).json({
      message: "✅ Property Approved  successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.setBookingtoPurchase = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const { data, error } = await propertyService.setBookingtoPurchaseService(
      propertyId
    );

    if (error) throw error;

    res.status(200).json({
      message: "✅ Property Approved  successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.setAllPartnerProperty = async (req, res) => {
  try {
    const { id } = req.user;

    if (!id) {
      return res.json({ message: "id not Found" });
    }
    const { data, error } = await propertyService.setAllPartnerPropertyService(
      id
    );

    if (error) throw error;

    res.status(200).json({
      message: "✅ Property Approved  successfully",
      partner_property: data,
    });
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};
