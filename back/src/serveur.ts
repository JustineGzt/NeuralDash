import express from 'express';
import cors from 'cors';
import { db } from './config/firebase';

const app = express();
app.use(cors()); // Très important pour que ton React puisse appeler Node
app.use(express.json());

// Endpoint pour récupérer les missions du HUD
app.get('/api/missions', async (req, res) => {
  try {
    const snapshot = await db.collection('missions').get();
    const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(missions);
  } catch (error) {
    res.status(500).send("Erreur lors de la récupération");
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Serveur Cyberpunk sur le port ${PORT}`));