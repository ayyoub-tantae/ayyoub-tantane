const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Configuration pour analyser le JSON dans les requêtes HTTP
app.use(bodyParser.json());

// Fonction pour charger les données depuis le fichier JSON
const loadData = () => {
  try {
    const data = fs.readFileSync('data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si le fichier n'existe pas encore, retourner une structure vide
    return { products: [], orders: [] };
  }
};

// Fonction pour sauvegarder les données dans le fichier JSON
const saveData = (data) => {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
};

// Route de test pour vérifier si le serveur fonctionne
app.get('/', (req, res) => {
  res.send('API REST pour la gestion des produits et commandes');
});

// Route GET pour récupérer tous les produits
app.get('/products', (req, res) => {
  const data = loadData();
  res.json(data.products);
});

// Route POST pour ajouter un produit
app.post('/products', (req, res) => {
  const data = loadData();
  const newProduct = req.body;
  
  // Validation des données reçues
  if (!newProduct.name || !newProduct.price) {
    return res.status(400).json({ error: 'Le nom et le prix du produit sont obligatoires' });
  }
  
  // Ajouter un ID unique au produit (simple incrémentation)
  const productId = data.products.length > 0 
    ? Math.max(...data.products.map(p => p.id)) + 1 
    : 1;
  
  newProduct.id = productId;
  
  // Ajouter le produit et sauvegarder
  data.products.push(newProduct);
  saveData(data);
  
  res.status(201).json({ message: 'Produit ajouté avec succès', product: newProduct });
});

// Route GET pour récupérer toutes les commandes
app.get('/orders', (req, res) => {
  const data = loadData();
  res.json(data.orders);
});

// Route POST pour ajouter une commande
app.post('/orders', (req, res) => {
  const data = loadData();
  const newOrder = req.body;
  
  // Validation des données reçues
  if (!newOrder.product || !newOrder.quantity) {
    return res.status(400).json({ error: 'Le produit et la quantité sont obligatoires' });
  }
  
  // Vérifier que le produit existe
  const productExists = data.products.some(p => p.name === newOrder.product);
  if (!productExists) {
    return res.status(400).json({ error: 'Le produit spécifié n\'existe pas' });
  }
  
  // Ajouter un ID unique à la commande
  const orderId = data.orders.length > 0 
    ? Math.max(...data.orders.map(o => o.id)) + 1 
    : 1;
  
  newOrder.id = orderId;
  newOrder.date = new Date().toISOString();
  
  // Ajouter la commande et sauvegarder
  data.orders.push(newOrder);
  saveData(data);
  
  res.status(201).json({ message: 'Commande créée avec succès', order: newOrder });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur API démarré et disponible sur http://localhost:${port}`);
});