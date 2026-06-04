import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ai_navigator_super_secret_jwt_2026_key';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Erişim engellendi. Token bulunamadı.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
    }
    req.user = user;
    next();
  });
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yetkilendirilmemiş kullanıcı.' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
    }
    next();
  };
}
