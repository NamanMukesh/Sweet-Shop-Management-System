import { User } from "../Models/index.js";
import { generateToken } from "../Utils/index.js";

export const register = async (req, res) => {
  try {
    // Log full request for debugging
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body));
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    const { name, email, password } = req.body;

    // Log received data for debugging
    console.log('Extracted fields:', {
      name: name ? (name.length > 0 ? name.substring(0, 10) + '...' : 'EMPTY') : 'MISSING',
      email: email ? (email.length > 0 ? email.substring(0, 10) + '...' : 'EMPTY') : 'MISSING',
      password: password ? (password.length > 0 ? '***' : 'EMPTY') : 'MISSING',
      nameType: typeof name,
      emailType: typeof email,
      passwordType: typeof password,
    });

    // Validate input - check for null, undefined, or empty strings
    if (!name || !email || !password) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password. All fields are required.",
      });
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid data types. All fields must be strings.",
      });
    }

    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password. All fields are required.",
      });
    }

    // Check if user already exists (normalize email for comparison)
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Checking for existing user with email:', normalizedEmail);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists. Please use a different email or try logging in.",
      });
    }

    // Create new user with trimmed values
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
    console.log('User created successfully:', user._id);

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("=== REGISTRATION ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      console.error("Validation errors:", messages);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    console.error("Unhandled error, returning 500");
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get user",
    });
  }
};

