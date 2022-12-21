// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

type Data = {
  message: string;
  data?: string;
};

const privateKey = 'eiei';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('call check header : ', req.headers.authorization);

  const getToken = req.headers.authorization?.split(' ')[1];

  if (!getToken) {
    return res.status(401).json({ message: 'no token!' });
  }

  // ยิงไปที่หลังบ้าน
  try {
    var decoded = jwt.verify(getToken, privateKey);
    if (!decoded) {
      return res.status(401).json({ message: 'verify token error' });
    }
    console.log('success');
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    console.log('error');
    return res.status(401).json({ message: 'something went wrong' });
  }
}
