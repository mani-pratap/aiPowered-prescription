import Medicine from '../models/Medicine.js';

// @desc    Get all shop medicines with filtering, sorting, pagination
// @route   GET /api/shop/medicines
// @access  Public
export const getShopMedicines = async (req, res) => {
  try {
    const { keyword, category, company, rxRequired, sort, page, limit } = req.query;
    
    const query = {};

    if (keyword) {
      query.$text = { $search: keyword };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (company) {
      query.manufacturer = company;
    }

    if (rxRequired !== undefined && rxRequired !== '') {
      query.prescriptionRequired = rxRequired === 'true';
    }

    // Safety Constraint: Strictly block all sleeping pills and sedatives
    const sleepPillRegex = /sleep|insomnia|sedative|zolpidem|diazepam|alprazolam|lorazepam|clonazepam|nitrazepam|zopiclone/i;
    query.$and = [
      { medicineName: { $not: sleepPillRegex } },
      { category: { $not: sleepPillRegex } }
    ];

    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOptions.price = 1;
          break;
        case 'price_desc':
          sortOptions.price = -1;
          break;
        case 'name_asc':
          sortOptions.medicineName = 1;
          break;
        case 'company':
          sortOptions.manufacturer = 1;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    } else {
      if (keyword) {
        sortOptions.score = { $meta: 'textScore' };
      } else {
        sortOptions.createdAt = -1;
      }
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 12;
    const skip = (pageNumber - 1) * pageSize;

    const medicines = await Medicine.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Medicine.countDocuments(query);

    res.json({
      medicines,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get shop medicine details
// @route   GET /api/shop/medicine/:id
// @access  Public
export const getShopMedicineById = async (req, res) => {
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
