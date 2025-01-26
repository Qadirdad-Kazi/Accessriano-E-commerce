const express = require("express");
const crypto = require("crypto");
const router = express.Router();

router.post("/initiate", (req, res) => {
  const { amount, email } = req.body;

  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD;
  const returnUrl = process.env.JAZZCASH_RETURN_URL;
  const hashKey = process.env.JAZZCASH_HASH_KEY;

  const date = new Date();
  const txnRefNo = `T${date.getTime()}`;
  const txnDateTime = date.toISOString().slice(0, 19).replace(/[-T:]/g, "");
  const expiryDateTime = new Date(date.getTime() + 15 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace(/[-T:]/g, "");

  const payload = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: (amount * 100).toString(),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: "billRef",
    pp_Description: "JazzCash Payment",
    pp_ReturnURL: returnUrl,
    pp_ExpiryDateTime: expiryDateTime,
    pp_SecureHash: "",
  };

  // Generate Secure Hash
  const secureHashString = `${hashKey}&${Object.values(payload).join("&")}`;
  payload.pp_SecureHash = crypto
    .createHash("sha256")
    .update(secureHashString)
    .digest("hex");

  res.status(200).json({
    redirectUrl: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform",
    payload,
  });
});

module.exports = router;
