const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();


const register = async (req, res) => {
  const { email, password, phone, prenom } = req.body;
  try {
    // Créer l'utilisateur sans spécifier le fournisseur
    const response = await auth.createUser({
      email: `${email}`,
      password: `${password}` ,
      phoneNumber: phone,
      displayName: prenom,
      providerId: 'password',  

    });
    console.log("Successfully created new user:", response);
    res.json(response);
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      console.log("Adresse e-mail déjà utilisée par un autre compte");
      res.json("already-authenticated");
    } else if (error.code === "auth/phone-number-already-exists") {
      console.log("Numéro de téléphone déjà utilisé par un autre compte");
      res.json("phone-number-already-in-use");
    }  
    else {
      console.log("Error creating new user:", error);
      res.status(500).json("error");
    }
  }
};

module.exports = {
  register,
}