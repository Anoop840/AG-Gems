const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/order.controller.js");

const { protect, authorize } = require("../middleware/auth.js");

router.use(protect);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

// Admin only routes
router.get("/", authorize("admin"), getAllOrders);
router.put("/:id/status", authorize("admin"), updateOrderStatus);
