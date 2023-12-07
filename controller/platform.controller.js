const admin = require("firebase-admin");
const bcrypt = require('bcrypt');
require("dotenv").config();

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

const register =async (req, res) =>{
  const{email, password} = req.body;

  try {
    // const query = db.collection("Clients").where("email", "==", `${email}`);
    // const snapshot = await query.get();

    const response = await auth.createUser({
      email: email,
      password: password,
    });

    if (response) {
      console.log("Successfully created new user:", response);
      res.json(response);
    }
    
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      console.log("Adresse e-mail déjà utilisée par un autre compte");
      // Traitez cette erreur de manière appropriée (redirection, message d'erreur, etc.)
      res.json("already-authenticated");
    } else {
      console.log("Error creating new user:", error);
    }
  }
}

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await auth.getUserByEmail(email);
   
  
      const isPasswordValid = await comparePassword(email, password);  // Vérifier le mot de passe ou d'autres conditions si nécessaire

      if (!isPasswordValid) {
        res.status(401).json({ error: 'InvalidCredentials' });
        return;
      }
  
      const customToken = await auth.createCustomToken(userRecord.uid);
  
      // Retournez le jeton personnalisé au client
      res.json({ customToken });
   

  } catch (error) {
    console.log('Error signing in:', error);
    // Gérez les erreurs de connexion de manière appropriée
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      res.status(401).json({ error: 'Invalid email or password' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};


async function comparePassword(email, inputPassword) {
  try {
    // Rechercher l'utilisateur dans la collection "Clients"
    const clientQuery = db.collection("Clients").where("email", "==", email);
    const clientSnapshot = await clientQuery.get();

    // Si l'utilisateur est trouvé dans la collection "Clients"
    if (!clientSnapshot.empty) {
      const clientDoc = clientSnapshot.docs[0].data();
      const clientHashedPassword = clientDoc.password;
      const isClientPasswordValid = await bcrypt.compare(inputPassword, clientHashedPassword);
      return isClientPasswordValid;
    }

    // Rechercher l'administrateur dans la collection "Admin"
    const adminQuery = db.collection("Admin").where("email", "==", email);
    const adminSnapshot = await adminQuery.get();

    // Si l'administrateur est trouvé dans la collection "Admin"
    if (!adminSnapshot.empty) {
      const adminDoc = adminSnapshot.docs[0].data();
      const adminHashedPassword = adminDoc.password;
      const isAdminPasswordValid = await bcrypt.compare(inputPassword, adminHashedPassword);
      return isAdminPasswordValid;
    }

    // Si ni l'utilisateur ni l'administrateur n'est trouvé
    console.log('Aucun utilisateur ou administrateur trouvé avec cet e-mail:', email);
    return false;
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
}


module.exports = {
  register,
  signIn,
}