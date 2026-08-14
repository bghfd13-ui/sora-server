export default function handler(req, res) {
  res.status(410).json({
    success: false,
    message: 'This legacy sign-in method has been removed. Use your Sora username and password.',
  });
}
