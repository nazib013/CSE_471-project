const NGO = require('../models/NGO');

// GET all verified NGOs (public)
exports.getAllNGOs = async (req, res) => {
  try {
    const { type, city, search } = req.query;
    const filter = { verified: true };

    if (type && type !== 'all') filter.type = type;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { services: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    const ngos = await NGO.find(filter).sort({ name: 1 });
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET single NGO by ID (public)
exports.getNGOById = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json(ngo);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET nearby NGOs within radius (lat, lng, radius in km)
exports.getNearbyNGOs = async (req, res) => {
  try {
    const { lat, lng, radius = 50, type } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Rough bounding box filter (1 degree ≈ 111 km)
    const delta = radiusKm / 111;
    const filter = {
      verified: true,
      latitude: { $gte: latNum - delta, $lte: latNum + delta },
      longitude: { $gte: lngNum - delta, $lte: lngNum + delta },
    };
    if (type && type !== 'all') filter.type = type;

    const ngos = await NGO.find(filter);

    // Calculate exact distance using Haversine formula
    const withDistance = ngos.map((ngo) => {
      const R = 6371;
      const dLat = ((ngo.latitude - latNum) * Math.PI) / 180;
      const dLng = ((ngo.longitude - lngNum) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latNum * Math.PI) / 180) *
          Math.cos((ngo.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return { ...ngo.toObject(), distance: Math.round(distance * 10) / 10 };
    });

    const filtered = withDistance
      .filter((n) => n.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── ADMIN ONLY ──────────────────────────────────────────────────────────────

// POST create NGO (admin)
exports.createNGO = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const ngo = new NGO(req.body);
    await ngo.save();
    res.status(201).json(ngo);
  } catch (err) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
};

// PUT update NGO (admin)
exports.updateNGO = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const ngo = await NGO.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json(ngo);
  } catch (err) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
};

// PATCH toggle verification (admin)
exports.toggleVerify = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    ngo.verified = !ngo.verified;
    await ngo.save();
    res.json(ngo);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE NGO (admin)
exports.deleteNGO = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const ngo = await NGO.findByIdAndDelete(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ message: 'NGO deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all NGOs including unverified (admin)
exports.getAllNGOsAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const ngos = await NGO.find().sort({ createdAt: -1 });
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
