// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';

type Data = {
  message: string;
  token?: string;
};

const privateKey = 'eiei';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    console.log(req.body);
    const { username, password } = req.body;

    const serialised = serialize('OursiteJWT', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialised);

    res.status(200).json({ message: 'Logout Success' });
  } else {
    res.status(400).json({ message: 'Something went wrong' });
  }
}
