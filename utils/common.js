export const handleError = (res, error) => {
  let message = "Server error";
    console.error("Error:", error);
  if (error.name === "ValidationError") {
    const firstError = Object.values(error.errors)[0];
    message = firstError.message;
    return res.status(400).json({ success: false, message });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value"
    });
  }

  if (error.message) message = error.message;

  res.status(500).json({
    success: false,
    message
  });
};