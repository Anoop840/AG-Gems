const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/order.controller");

const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

router.get("/", authorize("admin"), getAllOrders);
router.put("/:id/status", authorize("admin"), updateOrderStatus);

module.exports = router;
