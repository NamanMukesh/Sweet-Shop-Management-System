import { Sweet } from "../Models/index.js";

export const createSweet = async (req, res) => {
  try {
    const { name, category, price, quantity, description, image } = req.body;

    const sweet = await Sweet.create({
      name,
      category,
      price,
      quantity: quantity || 0,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Sweet created successfully",
      sweet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create sweet",
    });
  }
};

export const getAllSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sweets.length,
      sweets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sweets",
    });
  }
};

export const searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    let query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sweets = await Sweet.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sweets.length,
      sweets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Search failed",
    });
  }
};

export const getSweetById = async (req, res) => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: "Sweet not found",
      });
    }

    res.json({
      success: true,
      sweet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sweet",
    });
  }
};

export const updateSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity, description, image } = req.body;

    const sweet = await Sweet.findByIdAndUpdate(
      id,
      {
        name,
        category,
        price,
        quantity,
        description,
        image,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: "Sweet not found",
      });
    }

    res.json({
      success: true,
      message: "Sweet updated successfully",
      sweet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update sweet",
    });
  }
};

export const deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findByIdAndDelete(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: "Sweet not found",
      });
    }

    res.json({
      success: true,
      message: "Sweet deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete sweet",
    });
  }
};

export const purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: "Sweet not found",
      });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient quantity in stock",
      });
    }

    sweet.quantity -= quantity;
    await sweet.save();

    res.json({
      success: true,
      message: "Purchase successful",
      sweet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Purchase failed",
    });
  }
};

export const restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid quantity",
      });
    }

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: "Sweet not found",
      });
    }

    sweet.quantity += Number(quantity);
    await sweet.save();

    res.json({
      success: true,
      message: "Restocked successfully",
      sweet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Restock failed",
    });
  }
};

