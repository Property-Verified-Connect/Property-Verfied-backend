const express = require('express');
const { referIntoDB, getAllLeadtoApproved, setCustomerleadtoApproval, getAllApprovedLead, getPropertyName, setCustomerleadStatus, SetTerm, getUserApprovedLead } = require('../controllers/referController');
const authorize = require('../middleware/authorize');



const router = express.Router();

router.post('/referInDB' ,authorize(["user"]) ,referIntoDB);
router.get('/getAllLeadtoApproved' , getAllLeadtoApproved);
router.post('/setCustomerleadtoApproval' , setCustomerleadtoApproval);
router.post('/setCustomerleadStatus' , setCustomerleadStatus)
router.get('/getAllApprovedLead' ,authorize(["partner" ,"user"]) ,getAllApprovedLead);
router.get('/getPropertyName' ,authorize(["user"]) ,getPropertyName);
router.get('/getUserApprovedLead' , authorize(["user"]) , getUserApprovedLead);
router.post('/setTerms' , authorize(["user"]) , SetTerm);



module.exports = router;