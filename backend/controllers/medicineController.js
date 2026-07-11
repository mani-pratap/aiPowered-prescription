import Medicine from '../models/Medicine.js';

// @desc    Create a new medicine
// @route   POST /api/medicines
// @access  Private (Admin ideally)
export const createMedicine = async (req, res) => {
  try {
    const {
      medicineName,
      genericName,
      composition,
      brandName,
      manufacturer,
      category,
      dosageForm,
      strength,
      price,
      mrp,
      discount,
      purpose,
      commonUses,
      commonSideEffects,
      precautions,
      foodInteraction,
      storageInstructions,
      prescriptionRequired,
      alternativeMedicines,
      medicineImage,
    } = req.body;

    const medicineExists = await Medicine.findOne({ medicineName, manufacturer });

    if (medicineExists) {
      return res.status(400).json({ message: 'Medicine already exists' });
    }

    const medicine = await Medicine.create({
      medicineName,
      genericName,
      composition,
      brandName,
      manufacturer,
      category,
      dosageForm,
      strength,
      price,
      mrp,
      discount,
      purpose,
      commonUses,
      commonSideEffects,
      precautions,
      foodInteraction,
      storageInstructions,
      prescriptionRequired,
      alternativeMedicines,
      medicineImage,
    });

    if (medicine) {
      res.status(201).json(medicine);
    } else {
      res.status(400).json({ message: 'Invalid medicine data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all medicines (with pagination, search, filter, sorting)
// @route   GET /api/medicines
// @access  Public
export const getMedicines = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    
    // Filtering
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.manufacturer) filter.manufacturer = req.query.manufacturer;
    if (req.query.prescriptionRequired !== undefined) {
      filter.prescriptionRequired = req.query.prescriptionRequired === 'true';
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Searching
    const keyword = req.query.keyword
      ? {
          $or: [
            { medicineName: { $regex: req.query.keyword, $options: 'i' } },
            { genericName: { $regex: req.query.keyword, $options: 'i' } },
            { manufacturer: { $regex: req.query.keyword, $options: 'i' } },
            { composition: { $regex: req.query.keyword, $options: 'i' } },
            { category: { $regex: req.query.keyword, $options: 'i' } }
          ],
        }
      : {};

    // Sorting
    let sortStr = '-createdAt';
    if (req.query.sort) {
      const sortMap = {
        'priceAsc': 'price',
        'priceDesc': '-price',
        'nameAsc': 'medicineName',
        'nameDesc': '-medicineName',
        'companyAsc': 'manufacturer',
        'companyDesc': '-manufacturer',
        'categoryAsc': 'category',
        'categoryDesc': '-category'
      };
      if (sortMap[req.query.sort]) {
        sortStr = sortMap[req.query.sort];
      }
    }

    const count = await Medicine.countDocuments({ ...keyword, ...filter });
    const medicines = await Medicine.find({ ...keyword, ...filter })
      .sort(sortStr)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      medicines,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
      res.json(medicine);
    } else {
      res.status(404).json({ message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private (Admin ideally)
export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
      Object.assign(medicine, req.body);
      const updatedMedicine = await medicine.save();
      res.json(updatedMedicine);
    } else {
      res.status(404).json({ message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Admin ideally)
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
      await medicine.deleteOne();
      res.json({ message: 'Medicine removed' });
    } else {
      res.status(404).json({ message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search medicines (specific endpoint if needed)
// @route   GET /api/medicines/search
// @access  Public
export const searchMedicines = async (req, res) => {
  try {
    const keyword = req.query.q
      ? {
          $or: [
            { medicineName: { $regex: req.query.q, $options: 'i' } },
            { genericName: { $regex: req.query.q, $options: 'i' } },
            { manufacturer: { $regex: req.query.q, $options: 'i' } },
            { composition: { $regex: req.query.q, $options: 'i' } },
            { category: { $regex: req.query.q, $options: 'i' } }
          ],
        }
      : {};

    const medicines = await Medicine.find({ ...keyword }).limit(20);
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medicines by category
// @route   GET /api/medicines/category/:category
// @access  Public
export const getMedicinesByCategory = async (req, res) => {
  try {
    const medicines = await Medicine.find({ category: req.params.category });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medicines by generic name
// @route   GET /api/medicines/generic/:medicineName
// @access  Public
export const getMedicinesByGenericName = async (req, res) => {
  try {
    const medicines = await Medicine.find({ genericName: req.params.medicineName });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
