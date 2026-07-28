export const validateCreateRoom = (req, res, next) => {
  const { name, username } = req.body;

  if (!name?.trim() || !username?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Room name and username are required',
    });
  }

  if (name.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Room name must be 50 characters or less',
    });
  }

  if (username.trim().length > 30) {
    return res.status(400).json({
      success: false,
      message: 'Username must be 30 characters or less',
    });
  }

  next();
};

export const validateJoinRoom = (req, res, next) => {
  const { username } = req.body;

  if (!username?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Username is required',
    });
  }

  if (username.trim().length > 30) {
    return res.status(400).json({
      success: false,
      message: 'Username must be 30 characters or less',
    });
  }

  next();
};

export const validateRoomId = (req, res, next) => {
  const { roomId } = req.params;

  if (!roomId?.trim() || roomId.trim().length !== 8) {
    return res.status(400).json({
      success: false,
      message: 'Invalid room code',
    });
  }

  next();
};
